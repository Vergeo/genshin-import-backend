var express = require('express')
var router = express.Router();
const {initializeDatabase, getPool} = require('../database/db')

router.get('/getAll', async (req, res) => {
    try {
        const [result] = await getPool().query(
            'SELECT * FROM wishlists'
        )
        if(result.length === 0){
            return res.status(404).json({'error': 'wishlists is empty'})
        }
        res.status(200).json(result)
    } catch(err){
        res.status(500).json({'error': 'failed to fetch wishlists'})
    }
})

router.get('/get/:wishlist_id', async (req, res) => {
    try {
        const {wishlist_id} = req.params
        const [result] = await getPool().query(
            'SELECT * FROM wishlists WHERE wishlist_id = ?',
            [wishlist_id]
        )
        if(result.length === 0){
            return res.status(404).json({'error': 'wishlist not found'})
        }
        res.status(200).json(result)
    } catch(err){
        res.status(500).json({'error': 'failed to fetch wishlist'})
    }
})

router.post('/post', async (req, res) => {
    try {
        const {user_id, item_id} = req.body
        const [result] = await getPool().query(
            'INSERT INTO wishlists (user_id, item_id) VALUES (?, ?)',
            [user_id, item_id]
        )
        res.status(201).json({wishlist_id: result.insertId, user_id, item_id})
    } catch(err){
        res.status(500).json({'error': 'failed to post wishlist'})
    }
})

router.patch('/patch/:wishlist_id', async (req, res) => {
    try {
        const {wishlist_id} = req.params
        const {user_id, item_id} = req.body
        const [result] = await getPool().query(
            'UPDATE wishlists SET user_id = ?, item_id = ? WHERE wishlist_id = ?',
            [user_id, item_id, wishlist_id]
        )
        if(result.affectedRows === 0){
            return res.status(404).json({'error': 'wishlist not found'})
        }
        res.status(200).json({'message': 'wishlist updated'})
    } catch(err){
        res.status(500).json({'error': 'failed to update wishlist'})
    }
})

router.delete('/delete/:wishlist_id', async (req, res) => {
    try {
        const {wishlist_id} = req.params
        const [result] = await getPool().query(
            'DELETE FROM wishlists WHERE wishlist_id = ?',
            [wishlist_id]
        )
        if(result.affectedRows === 0){
            return res.status(404).json({'error': 'wishlist not found'})
        }
        res.status(200).json({'message': 'wishlist deleted'})
    } catch(err){
        res.status(500).json({'error': 'failed to delete wishlist'})
    }
})

module.exports = router;