var express = require("express");
var router = express.Router();
const { initializeDatabase, getPool } = require("../database/db");

router.get("/get-all-items", async (req, res) => {
	try {
		const [result] = await getPool().query(
			`SELECT * 
      FROM items`,
		);
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({ message: "failed to fetch items" });
	}
});

router.get("/get-item/:item_id", async (req, res) => {
	try {
		const { item_id } = req.params;
		const [result] = await getPool().query(
			`SELECT * 
      FROM items 
      WHERE item_id = ?`,
			[item_id],
		);
		if (result.length === 0) {
			return res.status(404).json({ message: "item not found" });
		}
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({ message: "failed to fetch item" });
	}
});

router.get("/get-items-by-type/:item_type", async (req, res) => {
	try {
		const { item_type } = req.params;
		const [result] = await getPool().query(
			`SELECT * 
      FROM items 
      WHERE item_type = ?`,
			[item_type],
		);
		if (result.length === 0) {
			res.status(404).json({ message: "item not found" });
		}
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({ message: "failed to fetch item" });
	}
});

router.get("/get-empty-stock", async (req, res) => {
	try {
		const [result] = await getPool().query(
			`SELECT * 
      FROM items 
      WHERE item_stock <= 0`,
		);
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({ message: "failed to fetch item" });
	}
});

router.get("/search/:item_name", async (req, res) => {
	try {
		const { item_name } = req.params;
		const [result] = await getPool().query(
			`SELECT * 
      FROM items 
      WHERE item_name = ?`,
			[item_name],
		);
		if (result.length === 0) {
			res.status(404).json({ message: "item not found" });
		}
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({ message: "failed to fetch item" });
	}
});

router.post("/create-item", async (req, res) => {
	try {
		const { item_name, item_type, item_description, item_stock, item_image, item_price } =
			req.body;
		const [result] = await getPool().query(
			`INSERT INTO items (item_name, item_type, item_description, item_stock, item_image, item_price) 
      VALUES (?, ?, ?, ?, ?, ?)`,
			[item_name, item_type, item_description, item_stock, item_image, item_price],
		);
		const item_id = result.insertId;
		res.status(201).json({
			item_id,
			item_name,
			item_type,
			item_description,
			item_stock,
			item_image,
			item_price,
		});
	} catch (err) {
		res.status(500).json({ message: "failed to create item" });
	}
});

router.patch("/update-item/:item_id", async (req, res) => {
	try {
		const { item_id } = req.params;
		const item_name = req.body.item_name ?? null;
		const item_type = req.body.item_type ?? null;
		const item_description = req.body.item_description ?? null;
		const item_stock = req.body.item_stock ?? null;
		const item_image = req.body.item_image ?? null;
		const item_price = req.body.item_price ?? null;
		const [result] = await getPool().query(
			`UPDATE items
      SET item_name = IFNULL(?, item_name),
      item_type = IFNULL(?, item_type),
      item_description = IFNULL(?, item_description),
      item_stock = IFNULL(?, item_stock),
      item_image = IFNULL(?, item_image),
      item_price = IFNULL(?, item_price)
      WHERE item_id = ?`,
			[item_name, item_type, item_description, item_stock, item_image, item_price, item_id],
		);
		if (result.affectedRows === 0) {
			return res.status(404).json({ message: "item not found" });
		}
		res.status(200).json({ message: "item updated" });
	} catch (err) {
		res.status(500).json({ message: "failed to update item" });
	}
});

router.delete("/delete-item/:item_id", async (req, res) => {
	try {
		const { item_id } = req.params;
		const [result] = await getPool().query(
			`DELETE FROM items 
      WHERE item_id = ?`,
			[item_id],
		);
		if (result.affectedRows === 0) {
			return res.status(404).json({ message: "item not found" });
		}
		res.status(200).json({ message: "item deleted" });
	} catch (err) {
		res.status(500).json({ message: "failed to delete item" });
	}
});

module.exports = router;
