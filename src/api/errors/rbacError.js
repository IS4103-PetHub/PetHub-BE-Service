const CustomError = require('./customError');

class RbacError extends CustomError {
    constructor(error) {
        let message = "Unknown RBAC error";
        let statusCode = 500;

        if (error.code === 'P2025') {
            message = 'Record not found';
            statusCode = 404;
        } else if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
            message = 'This permission code is already registered.';
            statusCode = 400;
        } else if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
            message = 'This name is already registered.';
            statusCode = 400;
        } else if (error.code === 'P2014') {
            message = 'Foreign key constraint failed on RBAC operation.';
            statusCode = 400;
        } else if (error.code === 'P2003') {
            if (error.meta?.target?.includes('permissionId')) {
                message = 'The specified permission does not exist.';
            } else if (error.meta?.target?.includes('userId')) {
                message = 'The specified user does not exist.';
            } else if (error.meta?.target?.includes('groupId')) {
                message = 'The specified user group does not exist.';
            } else {
                message = 'Invalid reference on RBAC operation.';
            }
            statusCode = 400;
        }

        super(message, statusCode);
    }
}

module.exports = RbacError;
