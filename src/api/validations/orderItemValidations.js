const { OrderItemStatus } = require('@prisma/client');

// Validator function
exports.validateStatusFilters = (filterString) => {
    // Split the input string by commas to get an array of statuses
    const statuses = filterString.split(',');
    // Validate each status
    for (const status of statuses) {
        // If the status is not a valid enum value, return false
        if (!Object.values(OrderItemStatus).includes(status)) {
            return false
        }
    }
    // If all statuses are valid, return the array of statuses
    return true;
}

exports.validateNumberList = (inputString) => {
    // Use a regular expression to match a string with numbers separated by commas
    const pattern = /^\d+(,\d+)*$/;
    return pattern.test(inputString);
  };