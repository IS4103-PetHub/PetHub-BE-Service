exports.isValidLength = async (data, length) => {
  return 0 < data.length && data.length <= length;
};

exports.isValidNumber = async (num) => {
  // Check if the string can be parsed into a positive integer
  const parsed = parseInt(num, 10);
  return !isNaN(parsed) && parsed > 0;
};

exports.isValidNumericIDs = async (ids) => {
  for (const element of ids) {
    if (!(await this.isValidNumber(element))) {
      return false;
    }
  }
  return true;
};
