
const calendarGroupValidations = require('../validations/calendarGroupValidation')
const baseValidations = require('../validations/baseValidation')
const calendarGroupService = require('../services/appointments/calendarGroupService');
const constants = require("../../constants/common");
const errorMessages = constants.errorMessages;


exports.getAllCalendarGroups = async (req, res, next) => {
    try {
        const includeTimeSlot = req.query.includeTimeSlot === 'true';
        const includeBooking = req.query.includeBooking === 'true';

        const calendarGroups = await calendarGroupService
            .getAllCalendarGroups(includeTimeSlot, includeBooking);

        res.status(200).json(calendarGroups);
    } catch (error) {
        next(error)
    }
}

exports.getAllCalendarGroupsByPetBusinessId = async (req, res, next) => {
    try {
        const petBusinessId = req.params.petBusinessId;
        if (!(await baseValidations.isValidInteger(petBusinessId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const includeTimeSlot = req.query.includeTimeSlot === 'true';
        const includeBooking = req.query.includeBooking === 'true';

        const calendarGroups = await calendarGroupService
            .getAllPetBusinessCalendarGroup(Number(petBusinessId), includeTimeSlot, includeBooking);

        res.status(200).json(calendarGroups);
    } catch (error) {
        next(error)
    }
}


exports.getCalendarGroupById = async (req, res, next) => {
    try {

        const calendarGroupId = req.params.calendarGroupId; // must be valid number
        if (!(await baseValidations.isValidInteger(calendarGroupId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const includeTimeSlot = req.query.includeTimeSlot === 'true';
        const includeBooking = req.query.includeBooking === 'true';

        const calendarGroups = await calendarGroupService
            .getCalendarGroupById(Number(calendarGroupId), includeTimeSlot, includeBooking);

        res.status(200).json(calendarGroups);
    } catch (error) {
        next(error)
    }
}


exports.createCalendarGroup = async (req, res, next) => {
    try {

        // TODO: use middleware to identify creator
        const petBusinessId = req.query.petBusinessId
        if (!await baseValidations.isValidInteger(petBusinessId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: petBusinessId` });
        }

        const calendarGroupPayload = req.body
        const validationResult = calendarGroupValidations.isValidCreateCalendarGroupPayload(calendarGroupPayload);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        const newCalendarGroup = await calendarGroupService.createCalendarGroup(calendarGroupPayload, Number(petBusinessId));

        res.status(201).json(newCalendarGroup);
    } catch (error) {
        next(error)
    }
}

exports.deleteCalendarGroup = async (req, res, next) => {
    try {
        const calendarGroupId = req.params.calendarGroupId;

        if (!await baseValidations.isValidInteger(calendarGroupId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: calendarGroupId` });
        }

        await calendarGroupService.deleteCalendarGroup(Number(calendarGroupId));
        res.status(200).json({ message: 'Calendar group deleted successfully.' });
    } catch (error) {
        // Passing errors to the next middleware for handling.
        next(error);
    }
}

exports.updateCalendarGroup = async (req, res, next) => {
    try {

        // TODO: use middleware to identify updater
        const calendarID = req.params.calendarGroupId; // must be valid number
        if (!(await baseValidations.isValidInteger(calendarID))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const calendarGroupPayload = req.body
        const validationResult = calendarGroupValidations.isValidUpdateCalendarGroupPayload(calendarGroupPayload);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        const updatedCalendarGroup = await calendarGroupService.updateCalendarGroup(Number(calendarID), calendarGroupPayload);

        res.status(200).json(updatedCalendarGroup);
    } catch (error) {
        next(error)
    }
}


exports.getAvailability = async (req, res, next) => {
    try {

        // TODO: identify user to see if user has permissions to check calendar group

        const calendarID = req.params.calendarID; // must be valid number

        if (!(await baseValidations.isValidInteger(calendarID))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const payload = {
            startTime: req.query.startTime,
            endTime: req.query.endTime,
            duration: req.query.duration
        };
        const validationResult = calendarGroupValidations.isValidAvailabilityPayload(payload);
        if (!validationResult.isValid) {
            return res.status(400).json({ error: validationResult.message });
        }

        const { startTime, endTime, duration } = payload; // Extract values from payload
        const availableSlots = await calendarGroupService.getAvailability(Number(calendarID), new Date(startTime), new Date(endTime), Number(duration));

        return res.status(200).json(availableSlots);
    } catch (error) {
        next(error)
    }
};
