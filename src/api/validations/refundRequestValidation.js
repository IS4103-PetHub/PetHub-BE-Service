const Joi = require('joi');
const { RefundStatus } = require('@prisma/client');
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

exports.validateStatusFilters = (filterString) => {
    // Split the input string by commas to get an array of statuses
    const statuses = filterString.split(',');
    // Validate each status
    for (const status of statuses) {
        // If the status is not a valid enum value, return false
        if (!Object.values(RefundStatus).includes(status)) {
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
