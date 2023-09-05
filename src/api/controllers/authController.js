const userValidation = require('../validations/userValidation')
const UserService = require('../services/user/baseUserService')

// For NOW its just checking username and password, will pend for prof response to see how the auth is suppose to be done
exports.authenticateUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const email = username
        if (!await userValidation.isValidEmail(email)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }
        const service = new UserService()
        const user = await service.login(email, password);

        res.json(user)
    } catch (error) {
        next(error)
    }
}