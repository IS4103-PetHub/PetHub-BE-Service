const CustomError = require('./customError');

class BookingError extends CustomError {
    constructor(error) {
        let message = "Unknown Booking error";
        let statusCode = 500;

        console.log(error);

        if (error.code === 'P2025') {
            message = 'Booking record not found';
            statusCode = 404;
        } else if (error.code === 'P2002') {
            message = 'There is already an existing booking with the same details.';
            statusCode = 400;
        } else if (error.code === 'P2014') {
            message = 'Foreign key constraint failed on Booking operation.';
            statusCode = 400;
        } else if (error.code === 'P2003') {
            if (error.meta?.target?.includes('Booking_serviceListingId_fkey (index)')) {
                message = 'The specified service listing does not exist.';
                statusCode = 404;
            } else if (error.meta?.target?.includes('Booking_timeSlotId_fkey (index)')) {
                message = 'The specified time slot does not exist.';
                statusCode = 404;
            } else {
                message = 'Invalid reference on Booking operation.';
                statusCode = 400;
            }
        }

        super(message, statusCode);
    }
}

module.exports = BookingError;
