require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3014;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// MySQL Connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+07:00"
});

// Test DB connection on startup
(async function testMySQL() {
  try {
    const conn = await pool.getConnection();
    console.log('Connected to MySQL:', process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.error('MySQL Failed:', err.message);
    process.exit(1);
  }
})();

// Root check
app.get("/api", (req, res) => {
  res.send("API is running");
});

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY lastUpdate DESC');
    res.json(rows);
  } catch (e) {
    console.error('Products Error:', e.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product by id
app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (e) {
    console.error('Product Error:', e.message);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, stock, category, location, image, status, brand, sizes, productCode, orderName } = req.body;
    const [result] = await pool.query(
      `INSERT INTO products (name, stock, category, location, image, status, brand, sizes, productCode, orderName, lastUpdate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, stock, category, location, image, status, brand, sizes, productCode, orderName]
    );
    res.status(201).json({ id: result.insertId, message: 'Product created' });
  } catch (e) {
    console.error('Create Error:', e.message);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 API running on port ${port}`);
});