const CustomError = require("./customError");

class AddressError extends CustomError {
  constructor(error) {
    let message = "Unknown error";
    let statusCode = 500;
    super(message, statusCode);
  }
}

module.exports = AddressError;
