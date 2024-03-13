const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db.js');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.static('public'));
app.use(express.json());
// app.use(cors({
//     origin: 'http://localhost:5173'
// }));
app.use(cors());

// Database Connection
connectDB();

// Template engine
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

// Routes
app.use('/api/files', require('./routes/files.js'));
app.use('/files', require('./routes/show.js'));
app.use('/files/download', require('./routes/download.js'));

// Error handling middleware (must be the last middleware)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
