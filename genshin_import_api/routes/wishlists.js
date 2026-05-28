var express = require("express");
var router = express.Router();
const { initializeDatabase, getPool } = require("../database/db");

router.get("/get-all-wishlists", async (req, res) => {
	try {
		const [result] = await getPool().query(
			`SELECT * 
            FROM wishlists`,
		);
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({ message: "failed to fetch wishlist" });
	}
});

router.get("/get-wishlist/:wishlist_id", async (req, res) => {
	try {
		const { wishlist_id } = req.params;
		const [result] = await getPool().query(
			`SELECT * 
            FROM wishlists 
            WHERE wishlist_id = ?`,
			[wishlist_id],
		);
		if (result.length === 0) {
			return res.status(404).json({ message: "wishlist not found" });
		}
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({ message: "failed to fetch wishlist" });
	}
});

// e.g: localhost:3000/wishlists/get-wishlists-by-users-items/query?user_id=6&item_id=7
router.get("/get-wishlists-by-users-items/query", async (req, res) => {
	try {
		const { user_id, item_id } = req.query;
		if (!user_id || !item_id) {
			return res.status(400).json({ message: "Missing user_id or item_id" });
		}
		const [result] = await getPool().query(
			`SELECT * 
            FROM wishlists 
            WHERE user_id = ? AND item_id = ?`,
			[user_id, item_id],
		);
		if (result.length === 0) {
			res.status(404).json({ message: "wishlist not found" });
		}
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({ message: "failed to fetch wishlist" });
	}
});

router.post("/create-wishlist", async (req, res) => {
	try {
		const { user_id, item_id } = req.body;
		const [result] = await getPool().query(
			`INSERT INTO wishlists (user_id, item_id) 
            VALUES (?, ?)`,
			[user_id, item_id],
		);
		const wishlist_id = result.insertId;
		res.status(201).json({ wishlist_id, user_id, item_id });
	} catch (err) {
		res.status(500).json({ message: "failed to create wishlist" });
	}
});

router.patch("/update-wishlist/:wishlist_id", async (req, res) => {
	try {
		const { wishlist_id } = req.params;
		const { user_id, item_id } = req.body;
		const [result] = await getPool().query(
			"UPDATE wishlists SET user_id = ?, item_id = ? WHERE wishlist_id = ?",
			[user_id, item_id, wishlist_id],
		);
		if (result.affectedRows === 0) {
			return res.status(404).json({ message: "wishlist not found" });
		}
		res.status(200).json({ message: "wishlist updated" });
	} catch (err) {
		res.status(500).json({ message: "failed to update wishlist" });
	}
});

router.delete("/delete-wishlist/:wishlist_id", async (req, res) => {
	try {
		const { wishlist_id } = req.params;
		const [result] = await getPool().query(
			`DELETE FROM wishlists 
            WHERE wishlist_id = ?`,
			[wishlist_id],
		);
		if (result.affectedRows === 0) {
			return res.status(404).json({ message: "wishlist not found" });
		}
		res.status(200).json({ message: "wishlist deleted" });
	} catch (err) {
		res.status(500).json({ message: "failed to delete wishlist" });
	}
});

module.exports = router;
