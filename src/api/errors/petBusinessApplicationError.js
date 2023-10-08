const CustomError = require("./customError");

class PetBusinessApplicationError extends CustomError {
  constructor(error) {
    let message = "Unknown error";
    let statusCode = 500;

    if (error.code === "P2014") {
      message = "This Pet Business already has an application tied to it";
      statusCode = 400;
    }
    if (error.code === "P2002") {
      message =
        "There exists a Pet Business application with this ID, but it is tied to a different Pet Business";
      statusCode = 400;
    }
    if (error.code === "P2003" || error.code === "P2025") {
      message = "Invalid ID provided for foreign key association.";
      statusCode = 400;
    }
    super(message, statusCode);
  }
}

module.exports = PetBusinessApplicationError;
