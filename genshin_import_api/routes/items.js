var express = require('express');
var router = express.Router();
const {initializeDatabase, getPool} = require('../database/db')

router.get('/getAll', async (req, res) => {
  try {
    const [result] = await getPool().query(
      'SELECT * FROM items'
    )
    if(result.length === 0){
      return res.status(404).json({'error': 'items is empty'})
    }
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({'error': 'failed to fetch items'})
  }
})

router.get('/get/:item_id', async (req, res) => {
  try {
    const {item_id} = req.params
    const [result] = await getPool().query(
      'SELECT * FROM items WHERE item_id = ?',
      [item_id]
    )
    if(result.length === 0){
      return res.status(404).json({'error': 'item not found'})
    }
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({'error': 'failed to fetch item'})
  }
})

router.post('/post', async (req, res) => {
  try {
    const {item_name, item_type, item_description, item_stock, item_image, item_price} = req.body
    const [result] = await getPool().query(
      'INSERT INTO items (item_name, item_type, item_description, item_stock, item_image, item_price) VALUES (?, ?, ?, ?, ?, ?)',
      [item_name, item_type, item_description, item_stock, item_image, item_price]
    )
    res.status(201).json({item_id: result.insertId, item_name, item_type, item_description, item_stock, item_image, item_price})
  } catch(err) {
    res.status(500).json({'error': 'failed to post item'})
  }
})

router.patch('/patch/:item_id', async (req, res) => {
  try {
    const {item_id} = req.params
    const {item_name, item_type, item_description, item_stock, item_image, item_price} = req.body
    const [result] = await getPool().query(
      'UPDATE items SET item_name = ?, item_type = ?, item_description = ?, item_stock = ?, item_image = ?, item_price = ? WHERE item_id = ?',
      [item_name, item_type, item_description, item_stock, item_image, item_price, item_id]
    )
    if(result.affectedRows === 0){
      return res.status(404).json({'error': 'item not found'})
    }
    res.status(200).json({'message': 'item updated'})
  } catch(err) {
    res.status(500).json({'error': 'failed to update item'})
  }
})

router.delete('/delete/:item_id', async (req, res) => {
  try {
    const {item_id} = req.params
    const [result] = await getPool().query(
      'DELETE FROM items WHERE item_id = ?',
      [item_id]
    )
    if(result.affectedRows === 0){
      return res.status(404).json({'error': 'item not found'})
    }
    res.status(200).json({'message': 'item deleted'})
  } catch(err) {
    res.status(500).json({'error': 'failed to delete item'})
  }
})

module.exports = router;
