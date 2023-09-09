const CustomError = require("./customError");

class TagError extends CustomError {
  constructor(error) {
    let message = "Unknown error";
    let statusCode = 500;

    if (error.code === "P2025") {
      message = "Tag not found";
      statusCode = 404;
    } else if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      message = "Duplicated tag name!";
      statusCode = 400;
    }
    super(message, statusCode);
  }
}

module.exports = TagError;
