const express = require("express");
const { initializeDatabase, getPool } = require("./database/db");
const usersRouter = require("./routes/users");
const itemsRouter = require("./routes/items");
const salesRouter = require("./routes/sales");
const authRouter = require("./routes/auth");

const app = express();
app.use(express.json());
app.use("/users", usersRouter);
app.use("/items", itemsRouter);
app.use("/sales", salesRouter);
app.use("/auth", authRouter);

app.get("/", (req, res) => {
	res.json({ message: "Genshin Import API is running" });
});

async function start() {
	try {
		await initializeDatabase();
		app.listen(3000, () => {
			console.log("Server running");
		});
	} catch (err) {
		console.error("Failed to start: ", err);
		process.exit(1);
	}
}

start();
