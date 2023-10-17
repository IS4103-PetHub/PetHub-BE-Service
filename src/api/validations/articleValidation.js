const {ArticleType} = require('@prisma/client')
const Joi = require("joi")

exports.validateArticleType = (type) => {
    return Object.values(ArticleType).includes(type)
}

exports.validateCreateAndUpdateArticlePayload = (payload) => {

    const schema = Joi.object({
        title: Joi.string()
            .trim()
            .pattern(/^[a-zA-Z0-9\s.,:'?!]+$/, 'Title pattern')
            .min(1)
            .required()
            .messages({
                'string.empty': 'Title must not be empty.',
                'string.pattern.base': 'Title must have a valid format.',
                'string.min': 'Title must contain at least one character.'
            }),
        content: Joi.string()
            .trim()
            .min(1)
            .required()
            .messages({
                'string.empty': 'Content must not be empty.',
                'string.min': 'Content must contain at least one character.'
            }),
        articleType: Joi.string()
            .trim()
            .valid('ANNOUNCEMENTS', 'TIPS_AND_TRICKS', 'EVENTS', 'OTHERS')
            .required(),
        file: Joi.any()
            .optional(),
        internalUserId: Joi.string()
            .trim()
            .required()
            .regex(/^\d+$/, 'numeric')
            .messages({
              'string.empty': 'Internal user ID must not be empty.',
              'string.pattern.base': 'Internal user ID must be a numeric string.',
            }),
        
    })

    const { error } = schema.validate(payload, { convert: false });
    if (error) {
        console.log(error);
        return { isValid: false, message: error.details[0].message };
    }

    return { isValid: true };


}