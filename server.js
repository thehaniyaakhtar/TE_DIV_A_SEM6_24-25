require('dotenv').config();

const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 4000;

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('❌ Error connecting to the database:', err.message);
        return;
    }
    console.log('✅ Connected to the MySQL database');
});

// Serve industry.html as the default landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'industry.html'));
});

// Handle signup requests
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Insert into database
    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.query(query, [username, email, password], (err, result) => {
        if (err) {
            console.error('❌ Signup failed:', err.message);
            return res.status(500).json({ message: 'Signup failed' });
        }

        console.log('✅ Signup successful');
        return res.redirect('/login.html');
    });
});

// Handle login requests
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check credentials
    const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('❌ Login failed:', err.message);
            return res.status(500).json({ message: 'Login failed' });
        }

        if (results.length > 0) {
            console.log('✅ Login successful');
            return res.redirect('/dashboard.html'); // ✅ Redirect to dashboard
        } else {
            console.log('❌ Invalid credentials');
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    });
});

// Serve Dashboard Page
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/logout', (req, res) => {
    res.redirect('/login.html');
});


// Start the server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
