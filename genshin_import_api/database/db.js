const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

async function initializeDatabase() {
    const tempConnection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT,
    });

    await tempConnection.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
    );
    console.log(`Database ${process.env.DB_NAME} Connected!`)
    await tempConnection.end();

    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        multipleStatements: true,
    });

    const schema = require('./schema')
    await pool.query(schema);
    console.log(`Tables are ready!`)
}

function getPool() {
    if (!pool) throw new Error(`Database not initialized!`);
    return pool;
    
}

module.exports = {initializeDatabase, getPool};

