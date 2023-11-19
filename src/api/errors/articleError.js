const CustomError = require('./customError');

class ArticleError extends CustomError {
    constructor(error) {
        let message = "Unknown Article error";
        let statusCode = 500;

        console.log("ARTICLE ERROR", error); // logging the detailed error might help in debugging

        if (error.code === 'P2025') {
            message = 'Article record not found';
            statusCode = 404;
        } 

        super(message, statusCode);
    }
}

module.exports = ArticleError;
