var express = require('express');
var router = express.Router();
const {initializeDatabase, getPool} = require('../database/db');
const {body, validationResult} = require('express-validator');

const userValidation = [
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

function validator(req, res, next) {
    const errors = validationResult(req);
    if(!errors.isEmpty) {
        return res.status(400).json({'error': errors.array()});
    }
    next;
}

router.get('/getAll', async (req, res) => {
    try {
        const [result] = await getPool().query(
            'SELECT * FROM users'
        )
        if(result.length === 0){
            return res.status(404).json({'error': 'users is empty'});
        }
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({'error': 'failed to fetch users'});
    }
})

router.get('/get/:user_id', async (req, res) => {
    try {
        const {user_id} = req.params;
        const [result] = await getPool().query(
            'SELECT * FROM users WHERE user_id = ?',
            [user_id]
        )
        if(result.length === 0) {
            return res.status(404).json({'error': 'user not found'});
        }
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({'error': 'failed to fetch user'});
    }
})

router.post('/post', userValidation, validator, async (req, res) => {
    try {
        const {username, password, full_name, role} = req.body;
        const [result] = await getPool().query(
            'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
            [username, password, full_name, role]
        )
        res.status(201).json({user_id: result.insertId, username, full_name, role});
    } catch (err) {
        res.status(500).json({'error': 'failed to post user'});
    }
})

router.patch('/patch/:user_id', async (req, res) => {
    try {
        const {user_id} = req.params;
        const {username, password, full_name, role} = req.body;
        const [result] = await getPool().query(
            'UPDATE users SET username = ?, password = ?, full_name = ?, role = ? WHERE user_id = ?',
            [username, password, full_name, role, user_id]
        )
        if(result.affectedRows === 0) {
            return res.status(404).json({'error': 'user not found'});
        }
        res.status(200).json({'message': 'user updated'});
    } catch(err){
        res.status(500).json({'error': 'failed to update user'});
    }
})

router.delete('/delete/:user_id', async (req, res) => {
  try {
    const {user_id} = req.params;
    const [result] = await getPool().query(
      'DELETE FROM users WHERE user_id = ?',
      [user_id]
    )
    if(result.affectedRows === 0){
      return res.status(404).json({'error': 'user not found'}) ; 
    }
    res.status(200).json({'message': 'user deleted'});

  } catch (err){
    res.status(500).json({'error': 'failed to delete user'});
  }
})

module.exports = router;
