var express = require('express');
var router = express.Router();
const {initializeDatabase, getPool} = require('../database/db')

router.get('/getAll', async (req, res) => {
    try {
        const [result] = await getPool().query(
            'SELECT * FROM sales'
        )
        if(result.length === 0){
            return res.status(404).json({'error': 'sales is empty'})
        }
        res.status(200).json(result)
    } catch(err){
        res.status(500).json({'error': 'failed to fetch sales'})
    }
})

router.get('/get/:sales_id', async (req, res) => {
    try {
        const {sales_id} = req.params
        const [result] = await getPool().query(
            'SELECT * FROM sales WHERE sales_id = ?',
            [sales_id]
        )
        if(result.length === 0){
            return res.status(404).json({'error': 'sale not found'})
        }
        res.status(200).json(result)
    } catch(err){
        res.status(500).json({'error': 'failed to fetch sale'})
    }
})

router.post('/post', async (req, res) => {
    try {
        const {user_id, item_id, quantity} = req.body
        const [result] = await getPool().query(
            'INSERT into sales (user_id, item_id, quantity) VALUES (?, ?, ?)',
            [user_id, item_id, quantity]
        )
        res.status(201).json({sales_id: result.insertId, user_id, item_id, quantity})
    } catch(err){
        res.status(500).json({'error': 'failed to post sale'})
    }
})

router.patch('/patch/:sales_id', async (req, res) => {
    try {
        const {sales_id} = req.params
        const {user_id, item_id, quantity} = req.body
        const [result] = await getPool().query(
            'UPDATE sales SET user_id = ?, item_id = ?, quantity = ? WHERE sales_id = ?',
            [user_id, item_id, quantity, sales_id]
        )
        if(result.affectedRows === 0){
            return res.status(404).json({'error': 'sale not found'})
        }
        res.status(200).json({'message': 'sale updated'})
    } catch(err){
        res.status(500).json({'error': 'failed to update sale'})
    }
})

router.delete('/delete/:sales_id', async (req, res) => {
    try {
        const {sales_id} = req.params
        const [result]  = await getPool().query(
            'DELETE FROM sales WHERE sales_id = ?',
            [sales_id]
        )
        if(result.affectedRows === 0){
            return res.status(404).json({'error': 'failed to delete sale'})
        }
        res.status(200).json({'message': 'sale deleted'})
    } catch(err){
        res.status(500).json({'error': 'failed to delete sale'})
    }
})

module.exports = router;