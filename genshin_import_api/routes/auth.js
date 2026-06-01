var express = require("express");
var router = express.Router();

const { OAuth2Client } = require("google-auth-library");
const { initializeDatabase, getPool } = require("../database/db");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const client = new OAuth2Client(
	"812623446171-rq9v5dcqo4dsp9jpnrnrh1jm6iphoc99.apps.googleusercontent.com",
);

const userRegisterValidation = [
	body("username")
		.trim()
		.notEmpty()
		.withMessage("Username is required")
		.isLength({ min: 3, max: 50 })
		.withMessage("Username must be 3-50 characters")
		.isAlphanumeric()
		.withMessage("Username must be alphanumeric only"),

	body("password")
		.trim()
		.notEmpty()
		.withMessage("Password is required")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.matches(/[A-Z]/)
		.withMessage("Password must contain at least one uppercase letter")
		.matches(/[0-9]/)
		.withMessage("Password must contain at least one number"),

	body("full_name")
		.trim()
		.notEmpty()
		.withMessage("Full name is required")
		.isLength({ max: 100 })
		.withMessage("Full name must be under 100 characters"),
];

const userLoginValidation = [
	body("username").trim().notEmpty().withMessage("Username is required"),

	body("password").trim().notEmpty().withMessage("Password is required"),
];

function validator(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: errors.array() });
	}
	next();
}

router.post("/user-register", userRegisterValidation, validator, async (req, res) => {
	try {
		const { username, password, full_name } = req.body;

		const role = "user";

		const [existingUser] = await getPool().query(
			`SELECT user_id
         FROM users
         WHERE username = ?`,
			[username],
		);

		if (existingUser.length > 0) {
			return res.status(409).json({
				message: "Username already exists",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const [result] = await getPool().query(
			`INSERT INTO users (username, password, full_name, role)
             VALUES (?, ?, ?, ?)`,
			[username, hashedPassword, full_name, role],
		);

		const user_id = result.insertId;

		const accessToken = jwt.sign(
			{
				user_id,
				username,
				role,
			},
			process.env.ACCESS_TOKEN,
			{
				expiresIn: "7d",
			},
		);

		res.status(201).json({
			user_id,
			username,
			full_name,
			role,
			accessToken,
		});
	} catch (err) {
		console.log(err);

		res.status(500).json({
			message: "failed to register user",
		});
	}
});

router.post("/user-login", userLoginValidation, validator, async (req, res) => {
	try {
		const { username, password } = req.body;

		const [result] = await getPool().query(
			`SELECT *
             FROM users
             WHERE username = ?`,
			[username],
		);

		if (result.length === 0) {
			return res.status(404).json({
				message: "Invalid user or password",
			});
		}

		const user = result[0];

		const isPasswordMatch = await bcrypt.compare(password, user.password);

		if (!isPasswordMatch) {
			return res.status(401).json({
				message: "Invalid user or password",
			});
		}

		const { user_id, full_name, role } = user;

		const accessToken = jwt.sign(
			{
				user_id,
				username: user.username,
				role,
			},
			process.env.ACCESS_TOKEN,
			{
				expiresIn: "7d", // adjust as needed
			},
		);

		res.status(200).json({
			user_id,
			username: user.username,
			full_name,
			role,
			accessToken,
		});
	} catch (err) {
		console.log(err);

		res.status(500).json({
			message: "failed to login user",
		});
	}
});

router.post("/google-login", async (req, res) => {
	try {
		const { google_token } = req.body;

		const ticket = await client.verifyIdToken({
			idToken: google_token,
			audience: "812623446171-rq9v5dcqo4dsp9jpnrnrh1jm6iphoc99.apps.googleusercontent.com",
		});

		const payload = ticket.getPayload();

		const email = payload.email;
		const full_name = payload.name;

		let username = payload.email.split("@")[0];

		const [users] = await getPool().query(
			`SELECT *
             FROM users
             WHERE email = ?`,
			[email],
		);

		let user;

		if (users.length === 0) {
			const role = "user";

			const [insertResult] = await getPool().query(
				`INSERT INTO users
                    (username, email, full_name, role, password)
                    VALUES (?, ?, ?, ?, ?)`,
				[username, email, full_name, role, ""],
			);

			user = {
				user_id: insertResult.insertId,
				username,
				email,
				full_name,
				role,
			};
		} else {
			user = users[0];
		}

		const accessToken = jwt.sign(
			{
				user_id: user.user_id,
				username: user.username,
				role: user.role,
			},
			process.env.ACCESS_TOKEN,
			{
				expiresIn: "7d",
			},
		);

		return res.status(200).json({
			user_id: user.user_id,
			username: user.username,
			full_name: user.full_name,
			email: user.email,
			role: user.role,
			accessToken,
		});
	} catch (err) {
		console.log(err);

		return res.status(401).json({
			message: "Invalid Google token",
		});
	}
});

module.exports = router;
