var express = require('express');
var router = express.Router();
const {initializeDatabase, getPool} = require('../database/db');
const bcrypt = require('bcrypt');
const {body, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userRegisterValidation = [
    body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({min: 3, max: 50}).withMessage('Username must be 3-50 characters')
    .isAlphanumeric().withMessage('Username must be alphanumeric only'),

    body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({min: 8}).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

    body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({max: 100}).withMessage('Full name must be under 100 characters')
]

const userLoginValidation = [
    body('username')
    .trim()
    .notEmpty().withMessage('Username is required'),
    
    body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
]

function validator(req, res, next) {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({'message': errors.array()});
    }
    next();
}

router.post('/user-register', userRegisterValidation, validator, async (req, res) => {
    try {
        const {username, password, full_name} = req.body;
        const role = 'user';
        const bcryptCost = 10;
        const hashedPassword = await bcrypt.hash(password, bcryptCost);
        const [result] = await getPool().query(
            `INSERT INTO users (username, password, full_name, role)
            VALUES (?, ?, ?, ?)`,
            [username, hashedPassword, full_name, role]
        )
        const user_id = result.insertId;
        const tokenPayload = {user_id, username, role};
        const accessToken = jwt.sign(
            tokenPayload, process.env.accessToken,
            {expiresIn: '15m'}
        );
        const refreshToken = jwt.sign(
            tokenPayload, process.env.refreshToken,
            {expiresIn: '1d'}
        );
        await getPool().query(
            `UPDATE users
            SET refresh_token = ?
            WHERE user_id = ?`,
            [refreshToken, user_id]
        )
        res.status(201).json({user_id, username, full_name, role, accessToken, refreshToken});
        
    } catch(err) {
        res.status(500).json({'message': 'failed to register user'});
    }
})

router.post('/user-login', userLoginValidation, validator, async (req, res) => {
    try {
        const {username, password} = req.body;
        const [result] = await getPool().query(
            `SELECT *
            FROM users
            WHERE username = ?`,
            [username]
        )
        if(result.length === 0){
            return res.status(404).json({'message': 'user not found'});
        }
        const user = result[0]
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch) {
            return res.status(401).json({'message': 'Invalid password'});
        }
        const {user_id, full_name, role} = user;
        const tokenPayload = {user_id, username: user.username, role};
        const accessToken = jwt.sign(
            tokenPayload, process.env.accessToken,
            {expiresIn: '15m'}
        );
        const refreshToken = jwt.sign(
            tokenPayload, process.env.refreshToken,
            {expiresIn: '1d'}
        );
        await getPool().query(
            `UPDATE users
            SET refresh_token = ?
            WHERE user_id = ?`,
            [refreshToken, user_id]
        )
        res.status(200).json({user_id, username: user.username, full_name, role, accessToken, refreshToken});
    } catch(err) {
        res.status(500).json({'message': 'failed to login user'});
    }
})

module.exports = router;