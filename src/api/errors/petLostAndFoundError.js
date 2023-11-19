const CustomError = require('./customError');

class PetLostAndFoundError extends CustomError {
    constructor(error) {
        let message = "Unknown Pet Lost and Found error";
        let statusCode = 500;
        console.log(error)

        if (error.code === 'P2025') {
            message = 'Pet Lost and Found record not found';
            statusCode = 404;
        }
        super(message, statusCode);
    }
}

module.exports = PetLostAndFoundError;