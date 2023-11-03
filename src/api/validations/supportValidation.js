
const baseValidation = require("./baseValidation")
const Joi = require('joi');
const { SupportCategoryEnum, Priority } = require('@prisma/client');

exports.isValidCreateSupportTicketPayload = (payload) => {
    const schema = Joi.object({
        reason: Joi.string()
            .trim()
            .min(1)
            .required()
            .messages({
                'string.empty': 'reason must not be empty.',
                'string.min': 'reason must contain at least one character.',
            }),
        supportCategory: Joi.string()
            .trim()
            .valid(...Object.values(SupportCategoryEnum))
            .required(),
        priority: Joi.string()
            .trim()
            .valid(...Object.values(Priority))
            .required(),
        files: Joi.any()
            .optional(),
    });

    const { error } = schema.validate(payload, { convert: false });
    if (error) {
        console.log(error);
        return { isValid: false, message: error.details[0].message };
    }

    return { isValid: true };
}


exports.isValidAddCommentPayload = (payload) => {
    const schema = Joi.object({
        comment: Joi.string()
            .trim()
            .min(1)
            .required()
            .messages({
                'string.empty': 'reason must not be empty.',
                'string.min': 'reason must contain at least one character.',
            }),
        userId: Joi.string()
            .pattern(/^\d+$/) // Ensure only digits
            .custom((value, helpers) => {
                const numberValue = parseInt(value, 10);
                if (numberValue <= 0) {
                    return helpers.error('string.invalid');
                }
                return numberValue;
            })
            .required()
            .messages({
                'string.pattern.base': 'userId must be a positive integer.',
                'string.invalid': 'userId must be greater than 0.',
                'string.empty': 'userId is required.',
            }),
        files: Joi.any()
            .optional(),
    });

    const { error } = schema.validate(payload, { convert: false });
    if (error) {
        console.log(error);
        return { isValid: false, message: error.details[0].message };
    }

    return { isValid: true };
}

exports.validateSupportCategoryType = (type) => {
    return Object.values(SupportCategoryEnum).includes(type)
}

exports.validatePriorityType = (type) => {
    return Object.values(Priority).includes(type)
}

