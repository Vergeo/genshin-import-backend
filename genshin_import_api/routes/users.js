var express = require('express');
var router = express.Router();
const {initializeDatabase, getPool} = require('../database/db');

router.get('/get-all-users', async (req, res) => {
    try {
        const [result] = await getPool().query(
            `SELECT user_id, username, full_name, role 
            FROM users`
        )
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({'message': 'failed to fetch user'});
    }
})

router.get('/get-users/:user_id', async (req, res) => {
    try {
        const {user_id} = req.params;
        const [result] = await getPool().query(
            `SELECT user_id, username, full_name, role 
            FROM users 
            WHERE user_id = ?`,
            [user_id]
        )
        if(result.length === 0){
            res.status(404).json({'message': 'user not found'});
        }
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({'message': 'failed to fetch user'});
    }
})

router.patch('/update-users/:user_id', async (req, res) => {
    try {
        const {user_id} = req.params;
        const username = req.body.username ?? null;
        const password = req.body.password ?? null;
        const full_name = req.body.full_name ?? null;
        const role = req.body.role ?? null;
        const [result] = await getPool().query(
            `UPDATE users
            SET username = IFNULL(?, username),
            password = IFNULL(?, password),
            full_name = IFNULL(?, full_name),
            role = IFNULL(?, role)
            WHERE user_id = ?`,
            [username, password, full_name, role, user_id]
        )
        if(result.affectedRows === 0) {
            return res.status(404).json({'message': 'user not found'});
        }
        res.status(200).json({'message': 'user updated'});
    } catch(err){
        res.status(500).json({'message': 'failed to update user'});
    }
})

router.delete('/delete-users/:user_id', async (req, res) => {
  try {
    const {user_id} = req.params;
    const [result] = await getPool().query(
      `DELETE FROM users 
      WHERE user_id = ?`,
      [user_id]
    )
    if(result.affectedRows === 0){
      return res.status(404).json({'message': 'user not found'}) ; 
    }
    res.status(200).json({'message': 'user deleted'});

  } catch (err){
    res.status(500).json({'message': 'failed to delete user'});
  }
})

module.exports = router;
