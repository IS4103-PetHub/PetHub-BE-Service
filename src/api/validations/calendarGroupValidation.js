const Joi = require('joi');

// Validation for the timePeriod object
const timePeriodValidation = () => {
    return Joi.object({
        startTime: Joi.string()
            .pattern(/^(?:[01]\d|2[0-3]):(?:[0-5]\d)$/)
            .messages({ 'string.pattern.base': 'startTime match the required format: HH:MM' })
            .required(),
        endTime: Joi.string()
            .pattern(/^(?:[01]\d|2[0-3]):(?:[0-5]\d)$/)
            .messages({ 'string.pattern.base': 'startTime match the required format: HH:MM' })
            .required()
            .custom((value, helpers) => {
                const startTime = helpers.state.ancestors[0].startTime;
                if (value <= startTime) {
                    return helpers.message('endTime must be after startTime');
                }
                return value;  // validation passed
            })
    });
};


const startDateValidation = () => {
    const today = new Date().toISOString().split('T')[0];
    return Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .custom((value, helpers) => {
            if (value <= today) {
                return helpers.message('startDate must be after today');
            }
            return value;  // validation passed
        })
        .messages({
            'string.pattern.base': 'startDate match the required format: YYYY-MM-DD',
        })
        .required();
};

// Validation for the recurrence object
const recurrenceValidation = () => {
    return Joi.object({
        pattern: Joi.string().valid('DAILY', 'WEEKLY')
            .messages({ 'any.only': 'pattern must be one of [DAILY, WEEKLY].' })
            .required(),
        startDate: startDateValidation(),
        endDate: Joi.string()
            .pattern(/^\d{4}-\d{2}-\d{2}$/)
            .custom((value, helpers) => {
                const startDate = helpers.state.ancestors[0].startDate;
                const threeMonthsFromNow = new Date();
                threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
                const maxDate = threeMonthsFromNow.toISOString().split('T')[0];

                if (new Date(value) <= new Date(startDate)) {
                    return helpers.message('endDate must be after startDate');
                }
                if (new Date(value) > new Date(maxDate)) {
                    return helpers.message('endDate must not be more than 3 months from current date');
                }
                return value;  // validation passed
            })
            .messages({
                'string.pattern.base': 'endDate match the required format: YYYY-MM-DD',
            })
            .required(),
        timePeriods: Joi.array()
            .items(timePeriodValidation())
            .min(1)
            .message('At least one timePeriod is required.')
            .required()
    });
};


// Validation for the timeslot object
// days is required only when the recurrence pattern is 'WEEKLY'.
const timeslotValidation = () => {
    return Joi.object({
        days: Joi.array()
            .items(Joi.string().valid('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'))
            .when('recurrence.pattern', {
                is: 'WEEKLY',
                then: Joi.required(),
                otherwise: Joi.optional()
            })
            .messages({
                'any.only': 'days must be one of [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY].',
                'any.required': 'days is compulsory if pattern is not DAILY',
            })
        ,
        vacancies: Joi.number().integer().min(1)
            .messages({
                'number.base': 'Vacancies must be a number.',
                'number.min': 'Vacancies must be at least 1.',
            })
            .required(),
        recurrence: recurrenceValidation().required()
    });
};

// Main validation function for the createCalendarGroup request payload
exports.isValidCreateCalendarGroupPayload = (payload) => {
    const schema = Joi.object({
        name: Joi.string()
            .trim()
            .pattern(/^[a-zA-Z\s.,]+$/, 'name pattern')
            .pattern(/[a-zA-Z]+/, 'alphabet presence')
            .messages({
                'string.empty': 'Name must not be empty.',
                'string.pattern.name': 'Name must have a valid format (only alphabets, spaces, periods, and commas are allowed) and must contain at least one alphabet character.'
            })
            .required(),
        description: Joi.string()
            .trim()
            .pattern(/^[a-zA-Z\s.,]+$/, 'description pattern')
            .pattern(/[a-zA-Z]+/, 'alphabet presence')
            .messages({
                'string.empty': 'Description must not be empty.',
                'string.pattern.name': 'Description must have a valid format (only alphabets, spaces, periods, and commas are allowed) and must contain at least one alphabet character.'
            })
            .optional(),
        timeslots: Joi.array()
            .items(timeslotValidation())
            .min(1)
            .message('At least one timeslot is required.')
            .required()
    });

    const { error } = schema.validate(payload, { convert: false });
    if (error) {
        console.log(error);
        return { isValid: false, message: error.details[0].message };
    }

    return { isValid: true };
};

