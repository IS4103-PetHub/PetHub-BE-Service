exports.isValidNumericID = async (id) => {
  return typeof id === "number" && id > 0;
};

exports.isValidLength = async (data, length) => {
  return 0 < data.length && data.length <= length;
};

exports.isValidInteger = async (num) => {
  // Check if the string is strictly an integer representation
  if (num !== parseInt(num, 10).toString()) {
    return false;
  }

  // Check if the string can be parsed into a positive integer
  const parsed = parseInt(num, 10);
  return !isNaN(parsed) && parsed > 0;
};

exports.isValidFloat = async (num) => {
  // Check if the string can be parsed into a float >= 0
  const parsed = parseFloat(num);
  return !isNaN(parsed) && parsed >= 0;
};

// Check if an array contains all positive IDs
// Takes in an array of string ids
exports.isValidNumericIDs = async (ids) => {
  for (const element of ids) {
    if (!(await this.isValidInteger(element))) {
      return false;
    }
  }
  return true;
};
