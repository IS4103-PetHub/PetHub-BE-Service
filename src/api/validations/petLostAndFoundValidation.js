const Joi = require("joi")
const baseValidation = require("./baseValidation")

exports.isValidCreateOrUpdatePetLostAndFoundPayload = (payload) => {
    const schema = Joi.object({
        title: Joi.string()
            .trim()
            .pattern(/^[a-zA-Z0-9\s.,]+$/, 'Title pattern')
            .min(1)
            .required()
            .messages({
                'string.empty': 'Title must not be empty.',
                'string.pattern.base': 'Title must have a valid format (only alphabets, numbers, spaces, periods, and commas are allowed).',
                'string.min': 'Title must contain at least one character.'
            }),
        description: Joi.string()
            .trim()
            .pattern(/^[a-zA-Z0-9\s.,]+$/, 'Description pattern')
            .min(1) 
            .required()
            .messages({
                'string.empty': 'Description must not be empty.',
                'string.pattern.base': 'Description must have a valid format (only alphabets, numbers, spaces, periods, and commas are allowed).',
                'string.min': 'Description must contain at least one character.'
            }),
        requestType: Joi.string()
            .trim()
            .valid('LOST_PET', 'FOUND_PET') 
            .required(),
        lastSeenDate: baseValidation.dateTimeValidation('lastSeenDate').required(),
        lastSeenLocation: Joi.string()
            .trim()
            .min(1) 
            .required()
            .messages({
                'string.empty': 'Last seen location must not be empty.',
                'string.min': 'Last seen location must contain at least one character.'
            }),
        file: Joi.any().optional(),
        petId: Joi.string()
            .trim()
            .optional()
            .pattern(/^[0-9]+$/) // Ensure it's a string containing only digits
            .messages({
                'string.pattern.base': 'petId must be a string containing only digits.'
            }),
        isResolved: Joi.string()
            .trim()
            .valid('true', 'false')
            .optional()
    })


    const { error } = schema.validate(payload, { convert: false });
    if (error) {
        console.log(error);
        return { isValid: false, message: error.details[0].message };
    }

    return { isValid: true };
}