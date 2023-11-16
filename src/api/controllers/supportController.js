const s3ServiceInstance = require("../services/s3Service");
const supportValidation = require("../validations/supportValidation")
const baseValidation = require("../validations/baseValidation")
const supportTicketService = require("../services/support/supportService")
const constants = require('../../constants/common')
const errorMessages = constants.errorMessages
const { SupportTicketStatus } = require('@prisma/client')



exports.createSupportTicket = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        if (!(await baseValidation.isValidInteger(userId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const data = req.body;
        const validationResult = supportValidation.isValidCreateSupportTicketPayload(data);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        if (req.files) {
            data.attachmentKeys = await s3ServiceInstance.uploadImgFiles(req.files, "support-ticket");
            data.attachmentURLs = await s3ServiceInstance.getObjectSignedUrl(data.attachmentKeys);
        }
        const userType = req.path.split("/")[1]
        const petOwnerType = "pet-owner"
        const petBusinessType = "pet-business"

        let supportTicket;
        if (userType == petOwnerType) {
            supportTicket = await supportTicketService.createPOSupportTicket(Number(userId), data);
        } else if (userType == petBusinessType) {
            supportTicket = await supportTicketService.createPBSupportTicket(Number(userId), data);
        } else {
            res.status(400).send({ message: "invalid request path" })
        }
        res.status(201).json(supportTicket);
    } catch (error) {
        next(error);
    }
};


exports.getSupportTicketById = async (req, res, next) => {
    try {
        const supportTicketId = req.params.supportTicketId;
        if (!(await baseValidation.isValidInteger(supportTicketId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const supportTicket = await supportTicketService.getSupportTicketById(Number(supportTicketId))
        res.status(200).json(supportTicket);
    } catch (error) {
        next(error)
    }
}

exports.getSupportTicketByUserId = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        if (!(await baseValidation.isValidInteger(userId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const supportTickets = await supportTicketService.getSupportTicketByUserId(Number(userId))
        res.status(200).json(supportTickets);
    } catch (error) {
        next(error)
    }
}

exports.getAllSupportTickets = async (req, res, next) => {
    try {
        const supportTickets = await supportTicketService.getAllSupportTickets()
        res.status(200).json(supportTickets);
    } catch (error) {
        next(error)
    }
}

exports.addComment = async (req, res, next) => {
    try {
        const supportTicketId = req.params.supportTicketId;
        if (!(await baseValidation.isValidInteger(supportTicketId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const data = req.body;
        const validationResult = supportValidation.isValidAddCommentPayload(data);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        if (req.files) {
            data.attachmentKeys = await s3ServiceInstance.uploadImgFiles(req.files, "support-ticket");
            data.attachmentURLs = await s3ServiceInstance.getObjectSignedUrl(data.attachmentKeys);
        }

        const newComment = await supportTicketService.addComment(Number(supportTicketId), data)
        res.status(201).json(newComment);
    } catch (error) {
        next(error)
    }

}

exports.closeResolveSupportTicket = async (req, res, next) => {
    try {
        const supportTicketId = req.params.supportTicketId;
        if (!(await baseValidation.isValidInteger(supportTicketId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const updatedStatus = await supportTicketService.updateSupportTicketStatus(Number(supportTicketId), SupportTicketStatus.CLOSED_RESOLVED)
        res.status(200).json(updatedStatus)
    } catch (error) {
        next(error)
    }
}

exports.closeUnresolveSupportTicket = async (req, res, next) => {
    try {
        const supportTicketId = req.params.supportTicketId;
        if (!(await baseValidation.isValidInteger(supportTicketId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const updatedStatus = await supportTicketService.updateSupportTicketStatus(Number(supportTicketId), SupportTicketStatus.CLOSED_UNRESOLVED)
        res.status(200).json(updatedStatus)
    } catch (error) {
        next(error)
    }
}

exports.reopenSupportTicket = async (req, res, next) => {
    try {
        const supportTicketId = req.params.supportTicketId;
        if (!(await baseValidation.isValidInteger(supportTicketId))) {
            return res.status(400).json({ message: errorMessages.INVALID_ID });
        }

        const updatedStatus = await supportTicketService.updateSupportTicketStatus(Number(supportTicketId), SupportTicketStatus.PENDING)
        res.status(200).json(updatedStatus)
    } catch(error) {
        next(error)
    }
}