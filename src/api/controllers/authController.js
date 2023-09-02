const EmailService = require('../services/eamilService');
const AuthHelper = require('../helpers/auth');
const userValidation = require('../validations/userValidation')
const UserService = require('../services/user/baseUserService')

// For NOW its just checking username and password, will pend for prof response to see how the auth is suppose to be done
exports.authenticateUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const email = username
        const service = new UserService()
        const user = await service.login(email, password);

        res.json(user)
    } catch (error) {
        next(error)
    }
}


exports.forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!userValidation.isValidEmail(email)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }
        
        const service = new UserService()
        const user = await service.verifyEmail(email)
        
        const newPassword = AuthHelper.generateNewPassword();
        await service.resetPassword(user, newPassword);

        const body = `
            Hello,
            
            The password for your pethub account with email ${email} has been reset to "${newPassword}". 
            Please login with the new password and change it to a new password immediately.
            
            Regards,
            Pethub
        `;

        await EmailService.sendEmail(email, 'PetHub Forget Password', body)

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        next(error)
    }
}