const baseValidations = require('../validations/baseValidation')
const reviewValidation = require('../validations/reviewValidations')
const reviewService = require('../services/serviceListing/reviewService')
const s3ServiceInstance = require("../services/s3Service.js");
const constants = require("../../constants/common");
const errorMessages = constants.errorMessages;
const { getUserFromToken } = require("../../utils/nextAuth");

exports.createReview = async (req, res, next) => {
    try {

        const token = req.headers['authorization'].split(' ')[1];
        const callee = await getUserFromToken(token);
        if (!callee) {
            return res.status(400).json({ message: "Unable to find request caller!" });
        }

        const orderItemId = req.query.orderItemId;
        if (!await baseValidations.isValidInteger(orderItemId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: orderItemId` });
        }

        const reviewPayload = req.body
        const validationResult = reviewValidation.isCreateReviewPayload(reviewPayload);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        if (req.files) {
            reviewPayload.attachmentKeys = await s3ServiceInstance.uploadImgFiles(req.files, "review");
            reviewPayload.attachmentURLs = await s3ServiceInstance.getObjectSignedUrl(
                reviewPayload.attachmentKeys
            );
        }

        const newReview = await reviewService.createReview(reviewPayload, orderItemId, callee)
        res.status(201).json(newReview)
    } catch (error) {
        next(error)
    }
}

exports.updateReview = async (req, res, next) => {
    try {

        const token = req.headers['authorization'].split(' ')[1];
        const callee = await getUserFromToken(token);
        if (!callee) {
            return res.status(400).json({ message: "Unable to find request caller!" });
        }

        const reviewId = req.params.id;
        if (!await baseValidations.isValidInteger(reviewId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: reviewId` });
        }

        const reviewPayload = req.body
        const validationResult = reviewValidation.isCreateReviewPayload(reviewPayload);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        if (req.files) {
            await reviewService.deleteFilesOfAReview(Number(reviewId))
            reviewPayload.attachmentKeys = await s3ServiceInstance.uploadImgFiles(req.files, "review");
            reviewPayload.attachmentURLs = await s3ServiceInstance.getObjectSignedUrl(
                reviewPayload.attachmentKeys
            );
        }

        const updatedReview = await reviewService.updateReview(reviewPayload, Number(reviewId), callee)
        res.status(200).json(updatedReview)
    } catch(error) {
        next(error)
    }
}

exports.deleteReview = async (req, res, next) => {
    try {

        const token = req.headers['authorization'].split(' ')[1];
        const callee = await getUserFromToken(token);
        if (!callee) {
            return res.status(400).json({ message: "Unable to find request caller!" });
        }

        const reviewId = req.params.id;
        if (!await baseValidations.isValidInteger(reviewId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: reviewId` });
        }

        await reviewService.deleteReview(Number(reviewId), callee)
        res.status(200).json("Review Successfully deleted")
    } catch(error) {
        next(error);
    }
}

exports.replyReview = async (req, res, next) => {
    try {

        const token = req.headers['authorization'].split(' ')[1];
        const callee = await getUserFromToken(token);
        if (!callee) {
            return res.status(400).json({ message: "Unable to find request caller!" });
        }

        const reviewId = req.params.id;
        if (!await baseValidations.isValidInteger(reviewId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: reviewId` });
        }

        const replyPayload = req.body;
        const validationResult = reviewValidation.isReviewReplyPayload(replyPayload);
        if (!validationResult.isValid) {
            res.status(400).send({ message: validationResult.message });
            return;
        }

        const review = await reviewService.replyReview(Number(reviewId), replyPayload, callee)
        res.status(200).json(review)
    } catch(error) {
        next(error)
    }
}

exports.getReviewById = async (req, res, next) => {
    try {
        const reviewId = req.params.id;
        if (!await baseValidations.isValidInteger(reviewId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: reviewId` });
        }

        const review = await reviewService.getReviewById(Number(reviewId))
        res.status(200).json(review)
    } catch(error) {
        next(error)
    }
}

exports.getAllReviews = async (req, res, next) => {
    try {
        const verifiedFilter = req.query.verifiedFilter;
        if(verifiedFilter && !(baseValidations.isValidBooleanString(verifiedFilter))) {
            return res.status(400).json({ message: `${errorMessages.INVALID_BOOL}: verifiedFilter` });
        }


    } catch(error) {
        next(error)
    }
}

exports.toggleLikedReview = async (req, res, next) => {
    try {
        
        const token = req.headers['authorization'].split(' ')[1];
        const callee = await getUserFromToken(token);
        if (!callee) {
            return res.status(400).json({ message: "Unable to find request caller!" });
        }

        const reviewId = req.params.id;
        if (!await baseValidations.isValidInteger(reviewId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: reviewId` });
        }

        const resposne = await reviewService.toggleLikedReview(Number(reviewId), callee)
        res.status(200).json(resposne)
    } catch(error) {
        next(error)
    }
}

exports.reportReview = async (req, res, next) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        const callee = await getUserFromToken(token);
        if (!callee) {
            return res.status(400).json({ message: "Unable to find request caller!" });
        }

        const reviewId = req.params.id;
        if (!await baseValidations.isValidInteger(reviewId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: reviewId` });
        }

        const reportReason = req.query.reportReason;
        if (!reviewValidation.isValidReportReason(reportReason)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_REPORT_REASON}: reportReason` });
        }

        const response = await reviewService.reportReview(Number(reviewId), callee, reportReason)
        res.status(200).json(response)
    } catch(error) {
        next(error)
    }
}

exports.resolveReview = async (req, res, next) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        const callee = await getUserFromToken(token);
        if (!callee) {
            return res.status(400).json({ message: "Unable to find request caller!" });
        }

        const reviewId = req.params.id;
        if (!await baseValidations.isValidInteger(reviewId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: reviewId` });
        }

        const response = await reviewService.resolveReview(Number(reviewId), callee)
        res.status(200).json(response)
    } catch(error) {
        next(error)
    }
}