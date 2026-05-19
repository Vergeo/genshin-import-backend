var express = require('express');
var router = express.Router();
const {initializeDatabase, getPool} = require('../database/db');

router.get('/get-all-sales', async (req, res) => {
    try {
        const [result] = await getPool().query(
            'SELECT * FROM sales'
        )
        res.status(200).json(result);
    } catch(err){
        res.status(500).json({'error': 'failed to fetch sale'});
    }
})

router.get('/get-sales/:sales_id', async (req, res) => {
    try {
        const {sales_id} = req.params;
        const [result] = await getPool().query(
            'SELECT * FROM sales WHERE sales_id = ?',
            [sales_id]
        )
        if(result.length === 0){
            return res.status(404).json({'error': 'sale not found'});
        }
        res.status(200).json(result);
    } catch(err){
        res.status(500).json({'error': 'failed to fetch sale'});
    }
})

router.get('/get-sales-by-users/:user_id', async (req, res) => {
    try {
        const {user_id} = req.params;
        const [result] = await getPool().query(
            'SELECT * FROM sales WHERE user_id = ?',
            [user_id]
        )
        if(result.length === 0){
            res.status(404).json({'error': 'sale not found'});
        }
        res.status(200).json(result);
    } catch(err){
        res.status(500).json({'error': 'failed to fetch sale'});
    }
})

router.get('/get-top-sales', async (req, res) => {
    try {
        const [result] = await getPool().query(
            'SELECT MAX(quantity) FROM sales LIMIT 10'
        )
        res.status(200).json(result);
    } catch(err){
        res.status(500).json({'error': 'failed to fetch sale'});
    }
})

router.post('/create-wishlists', async (req, res) => {
    try {
        const {user_id, item_id, quantity} = req.body;
        const [result] = await getPool().query(
            'INSERT into sales (user_id, item_id, quantity) VALUES (?, ?, ?)',
            [user_id, item_id, quantity]
        )
        res.status(201).json({sales_id: result.insertId, user_id, item_id, quantity});
    } catch(err){
        res.status(500).json({'error': 'failed to create sale'});
    }
})

router.patch('/patch/:sales_id', async (req, res) => {
    try {
        const {sales_id} = req.params;
        const {user_id, item_id, quantity} = req.body;
        const [result] = await getPool().query(
            'UPDATE sales SET user_id = ?, item_id = ?, quantity = ? WHERE sales_id = ?',
            [user_id, item_id, quantity, sales_id]
        )
        if(result.affectedRows === 0){
            return res.status(404).json({'error': 'sale not found'});
        }
        res.status(200).json({'message': 'sale updated'});
    } catch(err){
        res.status(500).json({'error': 'failed to update sale'});
    }
})

router.delete('/delete-wishlists/:sales_id', async (req, res) => {
    try {
        const {sales_id} = req.params;
        const [result]  = await getPool().query(
            'DELETE FROM sales WHERE sales_id = ?',
            [sales_id]
        )
        if(result.affectedRows === 0){
            return res.status(404).json({'error': 'sale not found'});
        }
        res.status(200).json({'message': 'sale deleted'});
    } catch(err){
        res.status(500).json({'error': 'failed to delete sale'});
    }
})

module.exports = router;