const CustomError = require('./customError');

class RbacError extends CustomError {
    constructor(error) {
        let message = "Unknown RBAC error";
        let statusCode = 500;
        console.log(error)
        console.log("DEBUGGGGGG: ", error.code)
        if (error.code === 'P2025') {
            message = 'Record not found';
            statusCode = 404;
        } else if (error.code === 'P2002') {
            message = 'There is already an existing association.';
            statusCode = 400;
        } else if (error.code === 'P2014') {
            message = 'Foreign key constraint failed on RBAC operation.';
            statusCode = 400;
        } else if (error.code === 'P2003') {
            if (error.meta?.target?.includes('UserGroupMembership_permissionId_fkey (index)')) {
                message = 'The specified permission does not exist.';
                statusCode = 404;
            } else if (error.meta?.field_name?.includes('UserGroupMembership_userId_fkey (index)')) {
                message = 'The specified user does not exist.';
                statusCode = 404;
            } else if (error.meta?.field_name?.includes('UserGroupMembership_groupId_fkey (index)')) {
                message = 'The specified user group does not exist.';
                statusCode = 404;
            } else {
                message = 'Invalid reference on RBAC operation.';
                statusCode = 400;
            }
        }

        super(message, statusCode);
    }
}

module.exports = RbacError;
