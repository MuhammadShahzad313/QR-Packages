const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const Stripe = require('stripe');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Stripe Key from .env


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// Database Connection
let db;
const dbConfig = {
    host: process.env.DB_HOST || process.env.MYSQLHOST,
    user: process.env.DB_USER || process.env.MYSQLUSER,
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    database: process.env.DB_NAME || process.env.MYSQLDATABASE,
    port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
    multipleStatements: true
};

// Prefer efficient object config if host is available, otherwise try URL
if (dbConfig.host) {
    db = mysql.createConnection(dbConfig);
} else if (process.env.MYSQL_URL || process.env.DATABASE_URL) {
    db = mysql.createConnection(process.env.MYSQL_URL || process.env.DATABASE_URL);
} else {
    console.error("No database configuration found!");
}

if (db) {
    db.connect(err => {
        if (err) {
            console.error('Database connection failed:', err);
        } else {
            console.log('Connected to MySQL database');

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
    });
}

// --- API Endpoints ---

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

// 4. Create Payment Intent (Stripe)
app.post('/api/create-payment-intent', async (req, res) => {
    const { total } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100), // Stripe expects cents
            currency: 'usd',
        });
        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
