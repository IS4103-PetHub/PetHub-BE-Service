const router = require('express').Router();
const AuthController = require('../controllers/auth')

router.post('/login', AuthController.authenticateUser)

module.exports = router;