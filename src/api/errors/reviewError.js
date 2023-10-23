const CustomError = require('./customError');

class ReviewError extends CustomError {
    constructor(error) {
        let message = "Unknown Review error";
        let statusCode = 500;
        console.log(error)

        if (error.code === 'P2025') {
            message = 'Review record not found';
            statusCode = 404;
        }
        super(message, statusCode);
    }
}

module.exports = ReviewError;