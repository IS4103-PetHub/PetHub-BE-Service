const Joi = require("joi")
const baseValidation = require("./baseValidation")

exports.isValidCreateOrUpdatePetLostAndFoundPayload = (payload) => {
    const schema = Joi.object({
        title: Joi.string()
            .trim()
            .min(1)
            .max(64)
            .required()
            .messages({
                'string.empty': 'Title must not be empty.',
                'string.min': 'Title must contain at least one character.',
                'string.max': 'Title has a maximum of sixty four characters.'
            }),
        description: Joi.string()
            .trim()
            .min(1) 
            .max(500)
            .required()
            .messages({
                'string.empty': 'Description must not be empty.',
                'string.min': 'Description must contain at least one character.',
                'string.max': 'Description has a maximum of five hundred characters.'
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
            .optional(),
        contactNumber: Joi.string()
            .trim()
            .pattern(/^[0-9]{8}$/)
            .required()
            .messages({
                'string.empty': 'Contact Number must not be empty.',
                'string.pattern.base': 'Contact number must be a string containing exactly 8 digits.'
            }),
    })


    const { error } = schema.validate(payload, { convert: false });
    if (error) {
        console.log(error);
        return { isValid: false, message: error.details[0].message };
    }

    return { isValid: true };
}