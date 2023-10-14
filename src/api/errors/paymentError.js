const CustomError = require("./customError");

class PaymentError extends CustomError {
  constructor(error) {
    let message = "Unknown error";
    let statusCode = 500;

    if (error.code === "P2025") {
      message = "Payment not found";
      statusCode = 404;
    }
    super(message, statusCode);
  }
}

module.exports = PaymentError;
