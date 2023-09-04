const router = require('express').Router();
const AuthController = require('../controllers/authController')

router.post('/login', AuthController.authenticateUser)

module.exports = router;