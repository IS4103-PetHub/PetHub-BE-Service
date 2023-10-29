const Joi = require('joi');
const baseValidation = require("./baseValidation")


const cartItemValidation = () => {
    return Joi.object({
        serviceListingId: baseValidation.integerValidation('serviceListingId').required(),
        quantity: baseValidation.integerValidation('quantity').required(),
    });
}

exports.isValidCheckoutPayload = (payload) => {
    const schema = Joi.object({
        paymentMethodId: Joi.string()
            .trim()
            .pattern(/^[a-zA-Z0-9_\-]+$/)
            .regex(/[a-zA-Z]/)
            .messages({
                'string.empty': 'paymentMethodId must not be empty.',
                'string.pattern.base': 'paymentMethodId must have a valid format (only alphabets, numbers, underscores, and dashes are allowed) and must contain at least one alphabet character.',
            })
            .required(),
        totalPrice: Joi.number()
            .min(0.00)
            .precision(2) // To ensure that totalPrice only has up to two decimal places
            .required()
            .messages({
                'number.base': 'totalPrice must be a number.',
                'number.min': 'totalPrice cannot be less than $0.00.',
                'number.precision': 'totalPrice can have up to 2 decimal places.',
                'number.empty': 'totalPrice is required.'
            }),
        userId: baseValidation.integerValidation('userId').required(),
        cartItems: Joi.array()
            .items(cartItemValidation())
            .min(1)
            .message('At least one cart item is required.')
            .required()
    });

    const { error } = schema.validate(payload, { convert: false });
    if (error) {
        console.log(error);
        return { isValid: false, message: error.details[0].message };
    }

    return { isValid: true };
}