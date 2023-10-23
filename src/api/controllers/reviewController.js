const baseValidations = require('../validations/baseValidation')
const reviewValidation = require('../validations/reviewValidations')
const reviewService = require('../services/serviceListing/reviewService')
const s3ServiceInstance = require("../services/s3Service.js");

exports.createReview = async (req, res, next) => {
    try {
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

        const newReview = await reviewService.createReview(reviewPayload, orderItemId)
        res.status(201).json(newReview)
    } catch (error) {
        next(error)
    }
}

exports.updateReview = async (req, res, next) => {
    try {
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

        const updatedReview = await reviewService.updateReview(reviewPayload, Number(reviewId))
        res.status(200).json(updatedReview)
    } catch(error) {
        next(error)
    }
}

exports.deleteReview = async (req, res, next) => {
    try {
        const reviewId = req.params.id;
        if (!await baseValidations.isValidInteger(reviewId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: reviewId` });
        }

        await reviewService.deleteReview(Number(reviewId))
        res.status(200).json("Review Successfully deleted")
    } catch(error) {
        next(error);
    }
}

exports.hideReview = async (req, res, next) => {
    try {
        const reviewId = req.params.id;
        if (!await baseValidations.isValidInteger(reviewId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: reviewId` });
        }

        const review = await reviewService.hideReview(Number(reviewId))
        res.status(200).json(review)
    } catch(error) {
        next(error)
    }
}

exports.showReview = async (req, res, next) => {
    try {
        const reviewId = req.params.id;
        if (!await baseValidations.isValidInteger(reviewId)) {
            return res.status(400).json({ message: `${errorMessages.INVALID_ID}: reviewId` });
        }

        const review = await reviewService.showReview(Number(reviewId))
        res.status(200).json(review)
    } catch(error) {
        next(error)
    }
}

exports.replyReview = async (req, res, next) => {
    try {
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

        const review = await reviewService.replyReview(Number(reviewId), replyPayload)
        res.status(200).json(review)
    } catch(error) {
        next(error)
    }
}