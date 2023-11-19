const { Category } = require("@prisma/client");
const Joi = require('joi');

exports.isValidCategory = async (strData) => {
  switch (strData) {
    case Category.PET_GROOMING:
    case Category.DINING:
    case Category.VETERINARY:
    case Category.PET_RETAIL:
    case Category.PET_BOARDING:
      return true;
    default:
      return false;
  }
};

exports.isValidBumpServiceListingPayload = (payload) => {
  const schema = Joi.object({
    paymentMethodId: Joi.string()
      .trim()
      .pattern(/^[a-zA-Z0-9_\-]+$/)
      .regex(/[a-zA-Z]/)
      .messages({
        'string.empty': 'paymentMethodId must not be empty.',
        'string.pattern.base': 'paymentMethodId must have a valid format (only alphabets, numbers, underscores, and dashes are allowed) and must contain at least one alphabet character.',
      })
      .required()
  });

  const { error } = schema.validate(payload, { convert: false });
  if (error) {
    console.log(error);
    return { isValid: false, message: error.details[0].message };
  }

  return { isValid: true };
}