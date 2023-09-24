
const baseValidations = require('../validations/baseValidation')
const bookingValidations = require('../validations/bookingValidation')

const bookingService = require('../services/appointments/bookingService')
const constants = require("../../constants/common");
const errorMessages = constants.errorMessages;

exports.createBooking = async (req, res, next) => {
    try {
        // TODO: use middleware to identify creator
        const petOwnerId = 10
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