const jwt = require("jsonwebtoken");

require("dotenv").config();

function authenticateToken(req, res, next) {
	const authHeader = req.headers["authorization"];

	if (!authHeader) {
		return res.status(401).json({
			message: "Access token required",
		});
	}

	const token = authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({
			message: "Access token required",
		});
	}

	jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
		if (err) {
			return res.status(403).json({
				message: "Invalid or expired token",
			});
		}

		req.user = decoded;

		next();
	});
}

module.exports = authenticateToken;
