const CustomError = require("./customError");

class ServiceListingError extends CustomError {
  constructor(error) {
    let message = "Unknown error";
    let statusCode = 500;

    if (error.code === "P2025") {
      message = "Service listing not found";
      if (
        error.meta?.cause?.includes(
          "No 'PetBusiness' record(s) (needed to inline the relation on 'ServiceListing' record(s)) was found"
        )
      ) {
        message = "Pet business not found or pet business ID is not valid";
      } else if (
        error.meta?.cause?.includes("records to be connected, found only")
      ) {
        message = "Some tags were not found or tag ID is not valid";
      }

      statusCode = 404;
    } else if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      message = "Duplicated tag name!";
      statusCode = 400;
    }
    super(message, statusCode);
  }
}

module.exports = ServiceListingError;
