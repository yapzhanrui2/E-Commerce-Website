const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const models = require('./models');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const reviewRoutes = require('./routes/review.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Cofeee Bean E-Commerce API' });
});

// Database initialization and server start
const PORT = process.env.PORT || 5005;

const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        // Prevent automatic sync in test environment
        if (process.env.NODE_ENV !== 'test') {
            // Sync database (in development, you might want to use {force: true} to recreate tables)
            await sequelize.sync();
            console.log('Database synchronized successfully.');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

initializeDatabase();

// Only start the server if we're not in a test environment
let server;
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export both app and server for testing
module.exports = { app, server };
