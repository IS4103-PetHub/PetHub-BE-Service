const Joi = require('joi');
const baseValidations = require("./baseValidation")

exports.isValidCommissionRulePayload = (payload) => {
    const schema = Joi.object({
        name: Joi.string()
            .trim()
            .pattern(/^[a-zA-Z0-9\s.,]+$/, 'name pattern')
            .pattern(/[a-zA-Z]+/, 'alphabet presence')
            .messages({
                'string.empty': 'Name must not be empty.',
                'string.pattern.name': 'Name must have a valid format (only alphabets, numbers, spaces, periods, and commas are allowed) and must contain at least one alphabet character.'
            })
            .required(),
        commissionRate: Joi.number()
            .min(0.0001) // Lowest percentage is 0.0001 (i.e., 0.01%)
            .max(1) // Max is 1 (i.e., 100%)
            .precision(4) // To ensure that commissionRate only has up to four decimal places
            .required()
            .messages({
                'number.base': 'Commission rate must be a number.',
                'number.min': 'Commission rate cannot be less than 0.01%.',
                'number.max': 'Commission rate cannot exceed 100%.',
                'number.precision': 'Commission rate can have up to 4 decimal places.',
                'number.empty': 'Commission rate is required.'
            })
    });

    const { error } = schema.validate(payload, { convert: false });
    if (error) {
        console.log(error);
        return { isValid: false, message: error.details[0].message };
    }

    return { isValid: true };
};


exports.isValidUpdateCommissionRulePayload = (payload) => {
    const schema = Joi.object({
        name: Joi.string()
            .trim()
            .pattern(/^[a-zA-Z0-9\s.,]+$/, 'name pattern')
            .pattern(/[a-zA-Z]+/, 'alphabet presence')
            .messages({
                'string.empty': 'Name must not be empty.',
                'string.pattern.name': 'Name must have a valid format (only alphabets, numbers, spaces, periods, and commas are allowed) and must contain at least one alphabet character.'
            })
            .optional(),
        commissionRate: Joi.number()
            .min(0.0001) // Lowest percentage is 0.0001 (i.e., 0.01%)
            .max(1) // Max is 1 (i.e., 100%)
            .precision(4) // To ensure that commissionRate only has up to four decimal places
            .optional()
            .messages({
                'number.base': 'Commission rate must be a number.',
                'number.min': 'Commission rate cannot be less than 0.01%.',
                'number.max': 'Commission rate cannot exceed 100%.',
                'number.precision': 'Commission rate can have up to 4 decimal places.',
                'number.empty': 'Commission rate is required.'
            }),
        petBusinessIds: Joi.array()
            .items(baseValidations.integerValidation('Pet Business ID'))
            .optional() // Making it optional as you might not want to force updating petBusinessIds every time
            .messages({
                'array.base': 'Pet Business IDs must be an array.'
            })
    });

    const { error } = schema.validate(payload, { convert: false });
    if (error) {
        console.log(error);
        return { isValid: false, message: error.details[0].message };
    }

    return { isValid: true };
};

