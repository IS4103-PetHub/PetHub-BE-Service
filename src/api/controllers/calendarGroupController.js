
const calendarGroupValidations = require('../validations/calendarGroupValidation')

exports.createCalendarGroup = async (req, res, next) => {
    try {
        const calendarGroupPayload = req.body
        // For now use query parameter to identify creator
        // TODO: user middleware to identify creator

        console.log("Before validation");
        const validationResult = calendarGroupValidations.isValidCreateCalendarGroupPayload(calendarGroupPayload);
        console.log("After validation", validationResult);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        res.status(201).json({ message: 'Calendar group created successfully' });
    } catch (error) {
        next(error)
    }
}