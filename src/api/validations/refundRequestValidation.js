const Joi = require('joi');
const baseValidation = require("./baseValidation")

exports.isValidRefundRequestPayload = (payload) => {
    const schema = Joi.object({
        orderItemId: Joi.number()
            .integer()
            .min(1)
            .required()
            .messages({
                'number.min': 'orderItemId must be positive integer',
                'number.base': 'orderItemId must be a number.',
                'number.integer': 'orderItemId must be an integer.',
                'number.empty': 'orderItemId is required.'
            }),
        reason: Joi.string()
            .trim()
            .required()
            .messages({
                'string.base': 'reason must be a string.'
            }),
    });

    const { error } = schema.validate(payload, { convert: false });
    if (error) {
        return { isValid: false, message: error.details[0].message };
    }

    return { isValid: true };
}


exports.isValidStatusChangeRequestPayload = (payload) => {
    const schema = Joi.object({
        comment: Joi.string()
            .trim()
            .required()
            .messages({
                'string.base': 'reason must be a string.'
            }),
    });

    const { error } = schema.validate(payload, { convert: false });
    if (error) {
        return { isValid: false, message: error.details[0].message };
    }

    return { isValid: true };
}