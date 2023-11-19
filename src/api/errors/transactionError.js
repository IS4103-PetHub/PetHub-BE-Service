const CustomError = require('./customError');

class TransactionError extends CustomError {
    constructor(error) {
        let message = "Unknown transaction error";
        let statusCode = 500;

        console.error(error); // Log the detailed error for debugging purposes.

        // Handling Prisma-specific error codes
        if (error.code === 'P2002') {
            message = 'A unique constraint would be violated. A similar record already exists.';
            statusCode = 400;
        } else if (error.code === 'P2025') {
            message = 'Record not found.';
            statusCode = 404;
        } else if (error.code === 'P2003') {
            message = 'Foreign key constraint failed. Related record cannot be found.';
            statusCode = 400;
        } else if (error.code === 'P2014') {
            message = 'A constraint conflict occurred during the transaction.';
            statusCode = 400;
        } else if (error.code === 'P2000') {
            message = 'Input value violates a column constraint.';
            statusCode = 400;
        } else if (error.code === 'P2001') {
            message = 'Data validation error occurred.';
            statusCode = 400;
        } // Extend as needed based on the Prisma errors you expect.

        // Custom handling for transaction-specific scenarios
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            if (error.meta?.target.includes('invoiceId')) {
                message = 'The specified invoice does not exist.';
            } else if (error.meta?.target.includes('orderItemId')) {
                message = 'The specified order item does not exist.';
            }
        }

        super(message, statusCode);
        // Additional properties related to Prisma can also be captured here.
        this.code = error.code;
    }
}

module.exports = TransactionError;
