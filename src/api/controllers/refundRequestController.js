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