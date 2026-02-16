const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
// Stripe removed
require('dotenv').config();

// Stripe initialization removed


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// Database Connection
// Database Connection
let db;

function handleDisconnect() {
    const dbConfig = process.env.DATABASE_URL || {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        multipleStatements: true
    };

    console.log('Attempting to connect to database...');
    // Log host only to avoid leaking passwords in logs
    if (typeof dbConfig === 'string') {
        console.log('Using Connection String (Hidden for security)');
    } else {
        console.log('Using Config Object:', { ...dbConfig, password: '****' });
    }

    db = mysql.createConnection(dbConfig);

    db.connect(err => {
        if (err) {
            console.error('❌ Database connection failed:', err.message);
            // Optional: setTimeout(handleDisconnect, 2000); // Auto-reconnect
        } else {
            console.log('✅ Connected to MySQL database');
            initializeSchema();
        }
    });

    db.on('error', err => {
        console.error('Database error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

function initializeSchema() {
    // Auto-run schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
        let schemaSql = fs.readFileSync(schemaPath, 'utf8');
        // Remove CREATE DATABASE and USE commands for production compatibility
        schemaSql = schemaSql.replace(/CREATE DATABASE.*?;/g, '').replace(/USE.*?;/g, '');

        db.query(schemaSql, (err, result) => {
            if (err) console.error('Schema initialization error (ignored):', err.message);
            else console.log('Database schema ensured.');
        });
    }
}

handleDisconnect();


// --- API Endpoints ---
app.use((req, res, next) => {
    if (!db || db.state === 'disconnected') {
        console.error('Request failed: Database not connected');
        return res.status(503).json({ error: 'Service Unavailable: Database not connected' });
    }
    next();
});

// Health Check (Important for Railway)
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// 1. Register User
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// 2. Login User
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        res.json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
    });
});

// 3. Get All Products
app.get('/api/products', (req, res) => {
    const query = 'SELECT * FROM products';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
});

// Stripe Payment Intent Endpoint Removed

// 5. Create Order
app.post('/api/orders', (req, res) => {
    const { items, shipping, total, method } = req.body;

    const orderQuery = `INSERT INTO orders (customer_name, address, city, country, total, payment_method) VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(orderQuery, [shipping.name, shipping.address, shipping.city, shipping.country, total, method], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        const orderId = result.insertId;
        const itemQuery = `INSERT INTO order_items (order_id, product_name, price, quantity) VALUES ?`;

        // Prepare items for batch insert. NOTE: Assuming price parsing is handled on frontend for this demo.
        const orderItems = items.map(item => [orderId, item.name, 0.00, 1]);

        db.query(itemQuery, [orderItems], (err, result) => {
            if (err) return res.status(500).json({ error: 'Error saving items' });
            res.status(201).json({ message: 'Order created', orderId });
        });
    });
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
