const CustomError = require("./customError");

class CommissionRuleError extends CustomError {
    constructor(error) {
        let message = "Unknown commission rule error";
        let statusCode = 500;

        if (error.code === "P2025") {
            message = "CommissionRule not found";
            statusCode = 404;
        } else if (error.code === "P2002" && error.meta?.target?.includes("name")) {
            message = "Duplicated commission rule name!";
            statusCode = 400;
        }
        // You can add more error handling specific to CommissionRule if needed
        super(message, statusCode);
    }
}

module.exports = CommissionRuleError;
