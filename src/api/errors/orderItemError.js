const CustomError = require('./customError');

class OrderItemsError extends CustomError {
    constructor(error) {
        let message = "Unknown OrderItems error";
        let statusCode = 500;

        console.log(error); // logging the detailed error might help in debugging

        if (error.code === 'P2025') {
            message = 'OrderItem record not found';
            statusCode = 404;
        } else if (error.code === 'P2002') {
            // Customize the message depending on the unique field that caused the error
            if (error.meta?.target?.includes('voucherCode')) {
                message = 'An OrderItem with this voucherCode already exists.';
            } else if (error.meta?.target?.includes('orderItemId')) {
                message = 'This orderItemId is already in use.';
            } else {
                message = 'Unique constraint violation.';
            }
            statusCode = 400;
        } else if (error.code === 'P2003') {
            message = 'Invalid foreign key reference for OrderItem.';
            statusCode = 400;
        } else if (error.code === 'P2014') {
            message = 'Foreign key constraint failed on the field: ' + (error.meta?.target?.[0] || '');
            statusCode = 400;
        }

        super(message, statusCode);
    }
}

module.exports = OrderItemsError;
