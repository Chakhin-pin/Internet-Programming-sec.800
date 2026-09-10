  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '.env') });
  const express = require('express');
  const cors = require('cors');
  const mysql = require('mysql2/promise');
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');

  const app = express();
  const port = process.env.PORT || 3014;
  const JWT_SECRET = process.env.JWT_SECRET;

  const requiredEnvironment = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
  ];
  const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);
  if (missingEnvironment.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvironment.join(', ')}`);
  }

  app.use(cors());
  // Product images are sent as Base64. The request grows by roughly one third
  // when encoded, so leave enough room for a normal compressed product photo.
  app.use(express.json({ limit: '12mb' }));

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

  // POST login - user credentials and roles are stored in MySQL.
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    try {
      const [rows] = await pool.query(
        'SELECT user_id, username, password, role FROM users WHERE username = ? LIMIT 1',
        [username.trim()]
      );
      const account = rows[0];
      const passwordMatches = account && await bcrypt.compare(password, account.password);

      if (!passwordMatches) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const user = {
        id: account.user_id,
        username: account.username,
        role: account.role,
      };
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );
      return res.json({ token, user });
    } catch (error) {
      console.error('Login Error:', error.message);
      return res.status(500).json({ error: 'Unable to sign in' });
    }
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

      const normalizedName = typeof name === 'string' ? name.trim() : '';
      const normalizedProductCode = typeof productCode === 'string' ? productCode.trim() : '';
      const normalizedCategory = typeof category === 'string' ? category.trim() : '';
      const normalizedStore = typeof storeAvailability === 'string' ? storeAvailability.trim() : '';
      const numericPrice = Number(price);
      const numericStock = Number(stock);

      if (!normalizedName || !normalizedProductCode || !normalizedCategory || !normalizedStore || !image) {
        return res.status(400).json({ error: 'Missing required product fields' });
      }
      if (typeof image !== 'string' || /^(blob:|file:|content:)/i.test(image)) {
        return res.status(400).json({
          error: 'รูปภาพยังเป็นไฟล์ชั่วคราว กรุณาเลือกหรือวางรูปใหม่แล้วลองอีกครั้ง',
        });
      }
      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ error: 'Price must be a number greater than or equal to zero' });
      }
      if (!Number.isInteger(numericStock) || numericStock < 0) {
        return res.status(400).json({ error: 'Stock must be a non-negative integer' });
      }

      const [result] = await pool.query(
        `INSERT INTO products
          (name, stock, category, location, image, status, brand, sizes, productCode, orderName, price, description, storeAvailability, lastUpdate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          normalizedName, numericStock, normalizedCategory, location ?? null, image, status ?? 'Active',
          brand ?? null, sizes ?? null, normalizedProductCode, orderName ?? null,
          numericPrice, description ?? null, normalizedStore,
        ]
      );
      res.status(201).json({ id: result.insertId, message: 'Product created' });
    } catch (e) {
      // Keep the full error in the server log, but return a useful, safe message
      // to the form so the user knows which input needs attention.
      console.error('Create Error:', {
        code: e.code,
        errno: e.errno,
        sqlMessage: e.sqlMessage,
        message: e.message,
      });
      if (e.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Product code already exists' });
      }
      if (e.code === 'ER_DATA_TOO_LONG') {
        const column = e.sqlMessage?.match(/column '([^']+)'/i)?.[1];
        return res.status(400).json({
          error: column
            ? `ข้อมูลในช่อง ${column} ยาวเกินกว่าที่ฐานข้อมูลรองรับ`
            : 'ข้อมูลบางช่องยาวเกินกว่าที่ฐานข้อมูลรองรับ',
        });
      }
      if (e.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(500).json({
          error: 'โครงสร้างฐานข้อมูลยังไม่รองรับข้อมูลจากฟอร์มนี้ กรุณาตรวจสอบ migration',
        });
      }
      if (e.code === 'ER_NO_DEFAULT_FOR_FIELD' || e.code === 'ER_BAD_NULL_ERROR') {
        return res.status(400).json({ error: 'มีข้อมูลจำเป็นบางรายการไม่ถูกส่งไปยังฐานข้อมูล' });
      }
      res.status(500).json({ error: 'บันทึกสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' });
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

  // Images sent as Base64 can exceed the JSON request limit before reaching the route.
  // Return a message the app can show instead of Express' default HTML error response.
  app.use((error, req, res, next) => {
    if (error?.type === 'entity.too.large') {
      return res.status(413).json({
        error: 'รูปภาพมีขนาดใหญ่เกิน 12 MB กรุณาเลือกรูปที่เล็กลง',
      });
    }
    if (error instanceof SyntaxError && 'body' in error) {
      return res.status(400).json({ error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' });
    }
    return next(error);
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 API running on port ${port}`);
  });
