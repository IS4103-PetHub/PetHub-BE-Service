const baseValidations = require("../validations/baseValidation");
const refundRequestValidation = require("../validations/refundRequestValidation");
const constants = require("../../constants/common");
const errorMessages = constants.errorMessages;
const refundRequestService = require("../services/finance/refundRequestService");

exports.createRefundRequest = async (req, res, next) => {
    try {
        const payload = req.body
        const validationResult = refundRequestValidation.isValidRefundRequestPayload(payload);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        const newRefundRequest = await refundRequestService.createRefundRequest(payload);
        res.status(201).json(newRefundRequest)
    } catch (error) {
        next(error)
    }
}

exports.cancelRefundRequest = async (req, res, next) => {
    try {
        const refundRequestId = req.params.refundRequestId; // must be valid number
        if (!(await baseValidations.isValidInteger(refundRequestId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const newRefundRequest = await refundRequestService.cancelRefundRequest(Number(refundRequestId));
        res.status(200).json(newRefundRequest)
    } catch (error) {
        next(error)
    }
}

exports.rejectRefundRequest = async (req, res, next) => {
    try {
        const refundRequestId = req.params.refundRequestId; // must be valid number
        if (!(await baseValidations.isValidInteger(refundRequestId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const payload = req.body
        const validationResult = refundRequestValidation.isValidStatusChangeRequestPayload(payload);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        const rejectedRefundRequest = await refundRequestService.rejectRefundRequest(Number(refundRequestId), payload);
        res.status(200).json(rejectedRefundRequest)
    } catch (error) {
        next(error)
    }
}

exports.approveRefundRequest = async (req, res, next) => {
    try {
        const refundRequestId = req.params.refundRequestId; // must be valid number
        if (!(await baseValidations.isValidInteger(refundRequestId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const payload = req.body
        const validationResult = refundRequestValidation.isValidStatusChangeRequestPayload(payload);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        const rejectedRefundRequest = await refundRequestService.approveRefundRequest(Number(refundRequestId), payload);
        res.status(200).json(rejectedRefundRequest)
    } catch (error) {
        next(error)
    }
}

exports.reopenRefundRequests = async (req, res, next) => {
    try {
        const refundRequestId = req.params.refundRequestId;
        if (!(await baseValidations.isValidInteger(refundRequestId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }
        const reopenRefundRequest = await refundRequestService.reopenRefundRequest(Number(refundRequestId))
        res.status(200).json(reopenRefundRequest)
    } catch(error) {
        next(error)
    }
}



exports.getRefundRequestById = async (req, res, next) => {
    try {
        const refundRequestId = req.params.refundRequestId; // must be valid number
        if (!(await baseValidations.isValidInteger(refundRequestId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const refundRequest = await refundRequestService.getRefundRequestById(Number(refundRequestId));
        res.status(200).json(refundRequest)
    } catch (error) {
        next(error)
    }
}

exports.getRefundRequestByPetBusinessId = async (req, res, next) => {
    try {
        const petBusinessId = req.params.petBusinessId; // must be valid number
        if (!(await baseValidations.isValidInteger(petBusinessId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const statusFilters = req.query.statusFilter;
        let statusFilterArray = undefined;
        if (statusFilters) {
            if (!refundRequestValidation.validateStatusFilters(statusFilters)) return res.status(400).json({ message: "invalid statusFilter query" })
            statusFilterArray = statusFilters.split(',');
        }

        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        if (startDate && endDate) {
            if (!(baseValidations.dateTimeValidation(startDate) && baseValidations.dateTimeValidation(endDate)))
                return res.status(400).json({ message: "invalid start and end Date" })
            if (new Date(startDate) > new Date(endDate))
                return res.status(400).json({ message: "start date must be before end date" })
        }

        const serviceListingFilters = req.query.serviceListingFilters;
        let serviceListingFilterArray = undefined;
        if (serviceListingFilters) {
            // validate 
            if (!(refundRequestValidation.validateNumberList(serviceListingFilters)))
                return res.status(400).json({ message: "invalid serviceListingFilter query" })
            serviceListingFilterArray = serviceListingFilters.split(',');
        }

        const refundRequests = await refundRequestService.getRefundRequestByPetBusinessId(
            Number(petBusinessId),
            statusFilterArray,
            startDate,
            endDate,
            serviceListingFilterArray)
        res.status(200).json(refundRequests)
    } catch (error) {
        next(error)
    }
}