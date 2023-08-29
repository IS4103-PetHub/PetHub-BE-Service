const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./users');
const authRoutes = require('./auth');

// Use route modules
router.use('/users', userRoutes);
router.use('/', authRoutes);

module.exports = router;