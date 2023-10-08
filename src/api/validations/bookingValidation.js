
const baseValidation = require("./baseValidation")
const Joi = require('joi');

exports.isValidCreateBookingPayload = (payload) => {
    const schema = Joi.object({
        calendarGroupId: baseValidation.integerValidation('calendarGroupId').required(),
        serviceListingId: baseValidation.integerValidation('serviceListingId').required(),
        startTime: baseValidation.dateTimeValidation('startTime').required(),
        endTime: baseValidation.dateTimeValidation('endTime').required()
            .custom((value, helpers) => {
                const startTime = helpers.state.ancestors[0].startTime;
                if (new Date(value) <= new Date(startTime)) {
                    return helpers.message('endTime must be after startTime');
                }
                return value;
            }),
        petId: baseValidation.integerValidation('petId').optional()
    });

    const { error } = schema.validate(payload, { convert: false });
    if (error) {
        console.log(error);
        return { isValid: false, message: error.details[0].message };
    }

    return { isValid: true };
};


exports.isValidUpdateBookingPayload = (payload) => {
    const schema = Joi.object({
        startTime: baseValidation.dateTimeValidation('startTime').required(),
        endTime: baseValidation.dateTimeValidation('endTime').required()
            .custom((value, helpers) => {
                const startTime = helpers.state.ancestors[0].startTime;
                if (new Date(value) <= new Date(startTime)) {
                    return helpers.message('endTime must be after startTime');
                }
                return value;
            }),
    });

    const { error } = schema.validate(payload, { convert: false });
    if (error) {
        console.log(error);
        return { isValid: false, message: error.details[0].message };
    }

    return { isValid: true };
};