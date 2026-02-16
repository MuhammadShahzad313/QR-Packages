const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create connection without database selected
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true // Allow running multiple queries from schema.sql
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL server.');

    // Read schema.sql
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    // Run the schema script
    connection.query(schemaSql, (err, results) => {
        if (err) {
            console.error('Error creating database/tables:', err);
        } else {
            console.log('Database and tables created successfully!');
            console.log('Products seeded.');
        }
        connection.end();
    });
});
