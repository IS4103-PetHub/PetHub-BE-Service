
const baseValidations = require('../validations/baseValidation')
const bookingValidations = require('../validations/bookingValidation')

const bookingService = require('../services/appointments/bookingService')
const constants = require("../../constants/common");
const errorMessages = constants.errorMessages;


exports.getBookings = [baseValidations.validateDateQuery, async (req, res, next) => {
    try {
        const { startTime, endTime } = req.query;
        const bookings = await bookingService.getBookings(new Date(startTime), new Date(endTime));
        res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
}];

exports.getBookingsByCalendarGroup = [baseValidations.validateDateQuery, async (req, res, next) => {
    try {
        const { calendarGroupId } = req.params;
        if (!await baseValidations.isValidInteger(calendarGroupId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: calendarGroupId` });
        }

        const { startTime, endTime } = req.query;
        const bookings = await bookingService.getBookingsByCalendarGroup(Number(calendarGroupId), new Date(startTime), new Date(endTime));
        res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
}];

exports.getBookingsByServiceListing = [baseValidations.validateDateQuery, async (req, res, next) => {
    try {
        const { serviceListingId } = req.params;
        if (!await baseValidations.isValidInteger(serviceListingId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: serviceListingId` });
        }

        const { startTime, endTime } = req.query;
        const bookings = await bookingService.getBookingsByServiceListing(Number(serviceListingId), new Date(startTime), new Date(endTime));
        res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
}];

exports.getBookingsByUser = [baseValidations.validateDateQuery, async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!await baseValidations.isValidInteger(userId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: userId` });
        }

        const { startTime, endTime } = req.query;
        const bookings = await bookingService.getBookingsByUser(Number(userId), new Date(startTime), new Date(endTime));
        res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
}];

exports.getBookingsByPetBusiness = [baseValidations.validateDateQuery, async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!await baseValidations.isValidInteger(userId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: userId` });
        }

        const { startTime, endTime } = req.query;
        const bookings = await bookingService.getBookingByPetBusiness(Number(userId), new Date(startTime), new Date(endTime));
        res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
}];

exports.createBooking = async (req, res, next) => {
    try {
        // TODO: use middleware to identify creator
        const petOwnerId = req.query.petOwnerId
        const payload = req.body
        const { calendarGroupId, serviceListingId } = payload

        if (!await baseValidations.isValidInteger(petOwnerId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID} petOwnerId` });
        }

        const validationResult = bookingValidations.isValidCreateBookingPayload(payload);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        const newBooking = await bookingService.createBooking(
            Number(petOwnerId), Number(calendarGroupId), Number(serviceListingId),
            new Date(payload.startTime), new Date(payload.endTime)
        )

        res.status(201).json(newBooking);
    } catch (error) {
        next(error)
    }
}


exports.updateBooking = async (req, res, next) => {
    try {
        // TODO: use middleware to Verify requestor
        const payload = req.body
        const bookingId = req.params.bookingId;

        if (!await baseValidations.isValidInteger(bookingId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID} bookingId` });
        }

        const validationResult = bookingValidations.isValidUpdateBookingPayload(payload);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        const updatedBooking = await bookingService.updateBooking(
            Number(bookingId), new Date(payload.startTime), new Date(payload.endTime)
        )

        res.status(200).json(updatedBooking);
    } catch (error) {
        next(error)
    }
}