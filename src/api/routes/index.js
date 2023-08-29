const express = require('express');
const router = express.Router();

// API endpoint health check
router.get('/', async (req, res, next) => {
    res.send({ message: 'Ok api is working 🚀' });
});

// Import route modules
const userRoutes = require('./userRoutes');
const authRoutes = require('./auth');

// Use route modules
router.use('/users', userRoutes);
router.use('/', authRoutes);

module.exports = router;