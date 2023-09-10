// src/api/errors/permissionError.js

const CustomError = require('./customError');

class PermissionError extends CustomError {
    constructor(error) {
        let message = "Unknown error";
        let statusCode = 500;

        if (error.code === 'P2025') {
            message = 'Permission not found';
            statusCode = 404;
        } else if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
            message = 'This permission name is already registered.';
            statusCode = 400;
        } else if (error.code === 'P2014') {
            message = 'Foreign key constraint failed on Permission operation.';
            statusCode = 400;
        } else if (error.code === 'P2003') {
            message = 'Invalid reference on Permission operation.';
            statusCode = 400;
        }

        super(message, statusCode);
    }
}

module.exports = PermissionError;
