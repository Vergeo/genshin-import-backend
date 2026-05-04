var express = require('express');
var router = express.Router();
const {initializeDatabase, getPool} = require('../database/db')

router.get('/getAll', async (req, res) => {
    try {
        const [result] = await getPool().query(
            'SELECT * FROM users'
        )
        if(result.length === 0){
            return res.status(404).json({'error': 'users is empty'})
        }
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({'error': 'failed to fetch users'})
    }
})

router.get('/get/:user_id', async (req, res) => {
    try {
        const {user_id} = req.params
        const [result] = await getPool().query(
            'SELECT * FROM users WHERE user_id = ?',
            [user_id]
        )
        if(result.length === 0) {
            return res.status(404).json({'error': 'user not found'})
        }
        res.status(200).json(result)
    } catch (err) {
        res.status(500).json({'error': 'failed to fetch user'})
    }
})

router.post('/post', async (req, res) => {
    try {
        const {username, password, full_name, role} = req.body;
        const [result] = await getPool().query(
            'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
            [username, password, full_name, role]
        )
        res.status(201).json({user_id: result.insertId, username, full_name, role});
    } catch (err) {
        res.status(500).json({'error': 'failed to post user'})
    }
})

router.patch('/patch/:user_id', async (req, res) => {
    try {
        const {user_id} = req.params
        const {username, password, full_name, role} = req.body
        const [result] = await getPool().query(
            'UPDATE users SET username = ?, password = ?, full_name = ?, role = ? WHERE user_id = ?',
            [username, password, full_name, role, user_id]
        )
        if(result.affectedRows === 0) {
            return res.status(404).json({'error': 'user not found'})
        }
        res.status(200).json({'message': 'user updated'})
    } catch(err){
        res.status(500).json({'error': 'failed to update user'})
    }
})

router.delete('/delete/:user_id', async (req, res) => {
  try {
    const {user_id} = req.params
    const [result] = await getPool().query(
      'DELETE FROM users WHERE user_id = ?',
      [user_id]
    )
    if(result.affectedRows === 0){
      return res.status(404).json({'error': 'user not found'})  
    }
    res.status(200).json({'message': 'user deleted'})

  } catch (err){
    res.status(500).json({'error': 'failed to delete user'})
  }
})

module.exports = router;
