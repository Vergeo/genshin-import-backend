var express = require("express");
var router = express.Router();
const { initializeDatabase, getPool } = require("../database/db");

const authenticateToken = require("../middlewares/authMiddleware");
router.use(authenticateToken);

router.get("/get-all-sales", async (req, res) => {
	try {
		const [result] = await getPool().query(
			`SELECT 
                s.*,
                i.item_name,
                i.item_type,
                i.item_description,
                i.item_stock,
                i.item_image,
                i.item_price
            FROM sales s
            JOIN items i
            ON s.item_id = i.item_id`,
		);

		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({
			message: "failed to fetch sale",
		});
	}
});

router.get("/get-sales/:sales_id", async (req, res) => {
	try {
		const { sales_id } = req.params;

		const [result] = await getPool().query(
			`SELECT 
                s.*,
                i.item_name,
                i.item_type,
                i.item_description,
                i.item_stock,
                i.item_image,
                i.item_price
            FROM sales s
            JOIN items i
            ON s.item_id = i.item_id
            WHERE s.sales_id = ?`,
			[sales_id],
		);

		if (result.length === 0) {
			return res.status(404).json({
				message: "sale not found",
			});
		}

		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({
			message: "failed to fetch sale",
		});
	}
});

router.get("/get-sales-by-users/:user_id", async (req, res) => {
	try {
		const { user_id } = req.params;

		const [result] = await getPool().query(
			`SELECT 
                s.*,
                i.item_name,
                i.item_type,
                i.item_description,
                i.item_stock,
                i.item_image,
                i.item_price
            FROM sales s
            JOIN items i
            ON s.item_id = i.item_id
            WHERE s.user_id = ?`,
			[user_id],
		);

		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({
			message: "failed to fetch sale",
		});
	}
});

router.get("/get-total-sale", async (req, res) => {
	try {
		const [result] = await getPool().query(
			`SELECT 
                SUM(s.quantity * i.item_price) AS total_sale
            FROM sales s
            JOIN items i
            ON s.item_id = i.item_id`,
		);

		res.status(200).json({
			total_sale: result[0].total_sale ?? 0,
		});
	} catch (err) {
		res.status(500).json({
			message: "failed to fetch total sale",
		});
	}
});

router.get("/get-top-sales", async (req, res) => {
	try {
		const [result] = await getPool().query(
			`SELECT 
                i.item_id,
                i.item_name,
                i.item_type,
                i.item_description,
                i.item_stock,
                i.item_image,
                i.item_price,
                SUM(s.quantity) AS total_quantity
            FROM sales s
            JOIN items i
            ON s.item_id = i.item_id
            GROUP BY 
                i.item_id,
                i.item_name,
                i.item_type,
                i.item_description,
                i.item_stock,
                i.item_image,
                i.item_price
            ORDER BY total_quantity DESC
            LIMIT 10`,
		);

		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({
			message: "failed to fetch top sales",
		});
	}
});

router.post("/create-sale", async (req, res) => {
	const connection = await getPool().getConnection();

	try {
		await connection.beginTransaction();

		const { user_id, item_id, quantity } = req.body;

		const [items] = await connection.query(
			`SELECT item_stock
             FROM items
             WHERE item_id = ?`,
			[item_id],
		);

		if (items.length === 0) {
			await connection.rollback();
			return res.status(404).json({
				message: "item not found",
			});
		}

		const currentStock = items[0].item_stock;

		if (currentStock < quantity) {
			await connection.rollback();
			return res.status(400).json({
				message: "not enough stock",
			});
		}

		const [saleResult] = await connection.query(
			`INSERT INTO sales (user_id, item_id, quantity)
             VALUES (?, ?, ?)`,
			[user_id, item_id, quantity],
		);

		await connection.query(
			`UPDATE items
             SET item_stock = item_stock - ?
             WHERE item_id = ?`,
			[quantity, item_id],
		);

		await connection.commit();

		res.status(201).json({
			sales_id: saleResult.insertId,
			user_id,
			item_id,
			quantity,
		});
	} catch (err) {
		await connection.rollback();
		console.log(err);

		res.status(500).json({
			message: "failed to create sale",
		});
	} finally {
		connection.release();
	}
});

router.patch("/update-sale/:sales_id", async (req, res) => {
	try {
		const { sales_id } = req.params;
		const { user_id, item_id, quantity } = req.body;
		const [result] = await getPool().query(
			"UPDATE sales SET user_id = ?, item_id = ?, quantity = ? WHERE sales_id = ?",
			[user_id, item_id, quantity, sales_id],
		);
		if (result.affectedRows === 0) {
			return res.status(404).json({ message: "sale not found" });
		}
		res.status(200).json({ message: "sale updated" });
	} catch (err) {
		res.status(500).json({ message: "failed to update sale" });
	}
});

router.delete("/delete-sale/:sales_id", async (req, res) => {
	try {
		const { sales_id } = req.params;
		const [result] = await getPool().query(
			`DELETE FROM sales
            WHERE sales_id = ?`,
			[sales_id],
		);
		if (result.affectedRows === 0) {
			return res.status(404).json({ message: "sale not found" });
		}
		res.status(200).json({ message: "sale deleted" });
	} catch (err) {
		res.status(500).json({ message: "failed to delete sale" });
	}
});

module.exports = router;
