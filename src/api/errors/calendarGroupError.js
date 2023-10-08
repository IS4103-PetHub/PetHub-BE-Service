const CustomError = require('./customError');

class CalendarGroupError extends CustomError {
    constructor(error) {
        let message = "Unknown CalendarGroup error";
        let statusCode = 500;
        console.log(error);

        if (error.code === 'P2025') {
            message = 'CalendarGroup record not found';
            statusCode = 404;
        } else if (error.code === 'P2002') {
            if (error.meta?.target && ['petBusinessId', 'name'].every(field => error.meta.target.includes(field))) {
                message = 'There is already an existing CalendarGroup with the same name for this pet business.';
            } else {
                message = 'Duplicate record error for CalendarGroup.';
            }
            statusCode = 400;
        } else if (error.code === 'P2014') {
            message = 'Foreign key constraint failed on CalendarGroup operation.';
            statusCode = 400;
        } else if (error.code === 'P2003') {
            if (error.meta?.target?.includes('CalendarGroup_petBusinessId_fkey')) {
                message = 'The specified pet business does not exist.';
                statusCode = 404;
            } else if (error.meta?.target?.includes('TimeSlot_calendarGroupId_fkey')) {
                message = 'The specified CalendarGroup for the time slot does not exist.';
                statusCode = 404;
            } else {
                message = 'Invalid reference on CalendarGroup operation.';
                statusCode = 400;
            }
        }

        super(message, statusCode);
    }
}

module.exports = CalendarGroupError;
