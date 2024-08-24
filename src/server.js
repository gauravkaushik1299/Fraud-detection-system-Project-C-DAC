const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');  // Import the CORS package

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:3001', // Your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true // Enable if you want to include cookies in the request
};

// Apply the CORS middleware with options
app.use(cors(corsOptions));

// Handle preflight requests (OPTIONS)
app.options('*', cors(corsOptions));

// Set up the PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres',       
    host: 'localhost',      
    database: 'postgres',  
    password: 'qwerty123@',   
    port: 5432,              
});

// POST route to search for trans_num in the PostgreSQL database
app.post('/search', async (req, res) => {
    const { trans_num } = req.body;  // Correctly extract trans_num here

    try {
        // Query the PostgreSQL database for the trans_num
        const result = await pool.query('SELECT is_fraud FROM transactions WHERE trans_num = $1', [trans_num]);

        if (result.rows.length > 0) {
            // If the trans_num is found, send the is_fraud value to the client
            res.json({ is_fraud: result.rows[0].is_fraud });
        } else {
            // If the trans_num is not found, send a 404 response
            res.status(404).json({ message: 'Transaction number not found' });
        }
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
