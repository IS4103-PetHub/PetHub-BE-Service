const CustomError = require("./customError");

class AddressError extends CustomError {
  constructor(error) {
    let message = "Unknown error";
    let statusCode = 500;

    if (error.code === "P2025") {
      message = "Invalid ID provided";
      statusCode = 400;
    }

    super(message, statusCode);
  }
}

module.exports = AddressError;
