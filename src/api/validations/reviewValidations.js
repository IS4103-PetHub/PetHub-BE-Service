const Joi = require("joi")
const baseValidation = require("./baseValidation")

exports.isCreateReviewPayload = (payload) => {
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
        comment: Joi.string()
            .trim()
            .min(1)
            .max(500)
            .required()
            .messages({
                'string.empty': 'Comment must not be empty.',
                'string.min': 'Comment must contain at least one character.',
                'string.max': 'Comment has a maximum of five hundred characters.'
            }),
        rating: Joi.string()
            .valid('1', '2', '3', '4', '5')
            .required()
            .messages({
                'string.empty': 'Rating is required.',
                'string.only': 'Rating must be one of 1, 2, 3, 4, 5.'
            }),
        file: Joi.any().optional(),
    })

    const { error } = schema.validate(payload, { convert: false });
    if (error) {
        console.log(error);
        return { isValid: false, message: error.details[0].message };
    }
    return { isValid: true };
}

exports.isReviewReplyPayload = (payload) => {
    const schema = Joi.object({
        reply: Joi.string()
            .trim()
            .min(1)
            .required()
            .messages({
                'string.empty': 'Title must not be empty.',
                'string.min': 'Title must contain at least one character.',
            }),
    })

    const { error } = schema.validate(payload, { convert: false });
    if (error) {
        console.log(error);
        return { isValid: false, message: error.details[0].message };
    }
    return { isValid: true };
}