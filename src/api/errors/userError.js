const CustomError = require('./customError')

class UserError extends CustomError {
    constructor(error) {
        let message = "Unknown error";
        let statusCode = 500;

        if (error.code === 'P2025') {
            message = 'User not found';
            statusCode = 404;
        } else if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            message = 'This email is already registered.';
            statusCode = 400;
        } else if (error.code === 'P2025') {
            message = 'This email is already registered.'
            statusCode = 400;
        }

        super(message, statusCode);
    }
}

module.exports = UserError;