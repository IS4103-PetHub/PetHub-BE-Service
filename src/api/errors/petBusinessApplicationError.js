const CustomError = require("./customError");

class PetBusinessApplicationError extends CustomError {
  constructor(error) {
    let message = "Unknown error";
    let statusCode = 500;

    if (error.code === "P2014") {
      message = "This Pet Business already has an application tied to it";
      statusCode = 400;
    }
    super(message, statusCode);
  }
}

module.exports = PetBusinessApplicationError;
