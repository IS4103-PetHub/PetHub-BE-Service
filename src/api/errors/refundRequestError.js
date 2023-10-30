const CustomError = require('./customError');

class RefundRequestError extends CustomError {
    constructor(error) {
        let message = "Unknown RefundRequest error";
        let statusCode = 500;
        console.log(error);

        if (error.code === 'P2025') {
            message = 'RefundRequest record not found';
            statusCode = 404;
        } else if (error.code === 'P2002') {
            if (error.meta?.target && error.meta.target.includes('orderItemId')) {
                message = 'There is already an existing RefundRequest with the same orderItemId.';
                statusCode = 400;
            } else {
                message = 'Duplicate record error for RefundRequest.';
                statusCode = 400;
            }
        } else if (error.code === 'P2014') {
            message = 'Foreign key constraint failed on RefundRequest operation.';
            statusCode = 400;
        } else if (error.code === 'P2003') {
            // Adjust the following based on your foreign key constraints if needed
            if (error.meta?.target?.includes('RefundRequest_petOwnerId_fkey')) {
                message = 'The specified pet owner does not exist.';
                statusCode = 404;
            } else if (error.meta?.target?.includes('RefundRequest_petBusinessId_fkey')) {
                message = 'The specified pet business does not exist.';
                statusCode = 404;
            } else {
                message = 'Invalid reference on RefundRequest operation.';
                statusCode = 400;
            }
        }

        super(message, statusCode);
    }
}

module.exports = RefundRequestError;
