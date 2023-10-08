module.exports = function errorHandler(err, req, res, next) {
    console.error("Error:", err);

    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'error';
    res.status(err.statusCode).json({
        status: err.statusCode,
        message: err.message
    });
};
