const CustomError = require('./customError');

class SupportTicketError extends CustomError {
    constructor(error) {
        let message = "Unknown SupportTicket error";
        let statusCode = 500;
        console.log(error);

        if (error.code === 'P2025') {
            message = 'Support ticket not found';
            statusCode = 404;
        } else if (error.code === 'P2002') {
            message = 'There is already an existing record for this support ticket.';
            statusCode = 400;
        } else if (error.code === 'P2014') {
            message = 'Foreign key constraint failed on SupportTicket operation.';
            statusCode = 400;
        } else if (error.code === 'P2003') {
            if (error.meta?.target?.includes('SupportTicket_petOwnerId_fkey')) {
                message = 'The specified pet owner does not exist.';
                statusCode = 404;
            } else if (error.meta?.target?.includes('SupportTicket_petBusinessId_fkey')) {
                message = 'The specified pet business does not exist.';
                statusCode = 404;
            } else if (error.meta?.target?.includes('Comment_supportTicketId_fkey')) {
                message = 'The specified support ticket for this comment does not exist.';
                statusCode = 404;
            } else if (error.meta?.target?.includes('Comment_userId_fkey')) {
                message = 'The specified user for this comment does not exist.';
                statusCode = 404;
            } else {
                message = 'Invalid reference on SupportTicket operation.';
                statusCode = 400;
            }
        }

        super(message, statusCode);
    }
}

module.exports = SupportTicketError;
