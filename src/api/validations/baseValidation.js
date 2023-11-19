const Joi = require('joi');

exports.isValidNumericID = async (id) => {
  return typeof id === "number" && id > 0;
};

exports.isValidLength = async (data, length) => {
  return 0 < data.length && data.length <= length;
};

exports.isValidInteger = async (num) => {
  // Check if the string is strictly an integer representation
  if (Number.isInteger(num)) {
    return num > 0
  }

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

exports.isValidBooleanString = (value) => {
  return value === "true" || value === "false";
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

exports.dateTimeValidation = (label) => {
  return Joi.string()
    .custom((value, helpers) => {
      if (isNaN(Date.parse(value))) {
        return helpers.message(`${label} must be a valid date in the format: YYYY-MM-DDTHH:MM:SS.sssZ`);
      }
      return value;
    }, 'Date Validation')
};

exports.validateDateQuery = (req, res, next) => {
  const schema = Joi.object({
    startTime: exports.dateTimeValidation('Start Date'),
    endTime: exports.dateTimeValidation('End Date')
  })
    .and('startTime', 'endTime') // both fields need to be present
    .custom((obj, helpers) => { // adding a custom validation to compare dates
      if (new Date(obj.endTime) <= new Date(obj.startTime)) {
        return helpers.message('End Date must be greater than Start Date');
      }
      return obj;
    })
    .options({ abortEarly: false });

  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({ message: error.details.map(detail => detail.message).join(', ') });
  }
  next();
};

exports.integerValidation = (label) => {
  return Joi.number()
    .integer()
    .min(1)
    .messages({
      'number.base': `${label} must be a number.`,
      'number.min': `${label} must be a valid positive integer.`
    });
};