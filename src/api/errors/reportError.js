const CustomError = require("./customError");

class ReportError extends CustomError {
  constructor(error) {
    let message = "Unknown Report error";
    let statusCode = 500;

    console.log(error);

    super(message, statusCode);
  }
}

module.exports = ReportError;
