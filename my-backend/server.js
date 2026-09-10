  require('dotenv').config();
  const express = require('express');
  const cors = require('cors');
  const mysql = require('mysql2/promise');
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');

  const app = express();
  const port = process.env.PORT || 3014;
  // ใช้ค่าใน .env ถ้ามี ไม่งั้น fallback เป็นค่า default (ควรตั้ง JWT_SECRET ใน .env จริงจังก่อน deploy ใช้งานจริง)
  const JWT_SECRET = process.env.JWT_SECRET || 'boxbox-dev-secret-change-me';

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

  // ---- Auth middleware ----

  // เช็คว่ามี JWT ที่ถูกต้องแนบมาไหม (Authorization: Bearer <token>) ใช้ป้องกันทุก endpoint ของ /api/products*
  function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }

    jwt.verify(token, JWT_SECRET, (err, payload) => {
      if (err) {
        return res.status(401).json({ error: 'Token expired or invalid' });
      }
      req.user = payload; // { userId, username, role }
      next();
    });
  }

  // เช็คว่า role เป็น admin เท่านั้น (ใช้กับ endpoint แก้ไข/ลบ)
  function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  }

  // ---- Auth routes ----

  // POST เข้าสู่ระบบ - เช็ค username/password กับตาราง users แล้วออก JWT กลับไป
  app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Hardcode สำหรับทดสอบ
  if (username === 'admin' && password === '1234') {
    const token = jwt.sign(
      { userId: 1, username: 'admin', role: 'admin' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({
      token,
      user: { id: 1, username: 'admin', role: 'admin' },
    });
  }
  
  return res.status(401).json({ error: 'Invalid username or password' });
});

  // GET all products - รองรับ search (q) + pagination (page, limit)
  // ต้อง login ก่อนถึงจะดูสินค้าได้ (authenticateToken) แต่ไม่ต้องเป็น admin
  app.get('/api/products', authenticateToken, async (req, res) => {
    try {
      const query = String(req.query.q ?? '').trim();
      const parsedPage = Number.parseInt(String(req.query.page ?? '1'), 10);
      const parsedLimit = Number.parseInt(String(req.query.limit ?? '50'), 10);
      const page = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;
      const limit = Number.isFinite(parsedLimit) ? Math.min(100, Math.max(1, parsedLimit)) : 50;
      const offset = (page - 1) * limit;

      // คอลัมน์ text ที่อนุญาตให้ search ได้ (แก้ชื่อให้ตรงกับตารางจริงถ้าไม่เหมือนนี้)
      const searchableColumns = ['name', 'category', 'brand', 'productCode'];
      // price เป็น decimal ต้อง cast เป็น string ก่อนถึงจะใช้ LIKE ค้นหาบางส่วนได้ (เช่น พิมพ์ "99" เจอ 999.00)
      const searchExpressions = [
        ...searchableColumns.map((col) => `${col} LIKE ?`),
        'CAST(price AS CHAR) LIKE ?',
      ];
      const whereClause = query
        ? `WHERE ${searchExpressions.join(' OR ')}`
        : '';
      const searchParams = query
        ? [...searchableColumns.map(() => `%${query}%`), `%${query}%`]
        : [];

      const [rows] = await pool.query(
        `SELECT * FROM products ${whereClause} ORDER BY lastUpdate DESC LIMIT ? OFFSET ?`,
        [...searchParams, limit, offset]
      );

      const [totalRows] = await pool.query(
        `SELECT COUNT(*) AS total FROM products ${whereClause}`,
        searchParams
      );

      res.json({ items: rows, total: totalRows[0].total, page, limit });
    } catch (e) {
      console.error('Products Error:', e.message);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  // GET single product by id
  app.get('/api/products/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      if (!/^\d+$/.test(id)) {
        return res.status(400).json({ error: 'Invalid product id' });
      }

      const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
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
  app.post('/api/products', authenticateToken, async (req, res) => {
    try {
      const {
        name, stock, category, location, image, status, brand, sizes,
        productCode, orderName, price, description, storeAvailability,
      } = req.body;
      const [result] = await pool.query(
        `INSERT INTO products
          (name, stock, category, location, image, status, brand, sizes, productCode, orderName, price, description, storeAvailability, lastUpdate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          name, stock, category, location ?? null, image, status ?? 'Active',
          brand ?? null, sizes ?? null, productCode, orderName ?? null,
          price, description ?? null, storeAvailability ?? null,
        ]
      );
      res.status(201).json({ id: result.insertId, message: 'Product created' });
    } catch (e) {
      console.error('Create Error:', e.message);
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  // PUT update existing product
  app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      if (!/^\d+$/.test(id)) {
        return res.status(400).json({ error: 'Invalid product id' });
      }

      const {
        name, stock, category, location, image, status, brand, sizes,
        productCode, orderName, price, description, storeAvailability,
      } = req.body;

      const [result] = await pool.query(
        `UPDATE products
        SET name = ?, stock = ?, category = ?, location = ?, image = ?, status = ?, brand = ?, sizes = ?, productCode = ?, orderName = ?, price = ?, description = ?, storeAvailability = ?, lastUpdate = NOW()
        WHERE id = ?`,
        [
          name, stock, category, location ?? null, image, status ?? 'Active',
          brand ?? null, sizes ?? null, productCode, orderName ?? null,
          price, description ?? null, storeAvailability ?? null, id,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ success: true, message: 'Product updated successfully' });
    } catch (e) {
      console.error('Update Product Error:', e.message);
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  // DELETE product
  app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      if (!/^\d+$/.test(id)) {
        return res.status(400).json({ error: 'Invalid product id' });
      }

      const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (e) {
      console.error('Delete Product Error:', e.message);
      res.status(500).json({ error: 'Failed to delete product: ' + (e.message || 'Unknown error') });
    }
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 API running on port ${port}`);
  });