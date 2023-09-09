const CustomError = require('./customError');

class UserGroupError extends CustomError {
    constructor(error) {
        let message = "Unknown error";
        let statusCode = 500;

        if (error.code === 'P2025') {
            message = 'User Group not found';
            statusCode = 404;
        } else if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
            message = 'This user group name is already registered.';
            statusCode = 400;
        } else if (error.code === 'P2014') {
            message = 'Foreign key constraint failed on UserGroup operation.';
            statusCode = 400;
        } else if (error.code === 'P2003') {
            // This error is returned when you are referencing a value that doesn't exist.
            // For example, if you try to create a UserGroupMembership where the groupId is set to a 
            // value that doesn't exist in the UserGroup table, Prisma will return this error.
            message = 'Invalid reference on UserGroup operation.';
            statusCode = 400;
        }

        super(message, statusCode);
    }
}

module.exports = UserGroupError;
