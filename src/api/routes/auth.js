const router = require('express').Router();
const AuthController = require('../controllers/authController')

router.post('/login', AuthController.authenticateUser)
router.post('/forget-password', AuthController.forgetPassword)

module.exports = router;