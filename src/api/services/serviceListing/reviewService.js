const prisma = require('../../../../prisma/prisma');
const CustomError = require('../../errors/customError');
const ReviewError = require('../../errors/reviewError')
const orderItemService = require("../finance/orderItemService");
const serviceListingService = require("../serviceListing/baseServiceListing")
const s3ServiceInstance = require("../s3Service");

class ReviewService {

    async createReview(payload, orderItemId) {
        try {

            const orderItem = await orderItemService.getOrderItemById(Number(orderItemId));
            if (orderItem.review) {
                throw new CustomError("orderItem already has a review", 400)
            }
            const serviceListingId = orderItem.serviceListingId;
            const serviceListing = await serviceListingService.getServiceListingById(serviceListingId)

            let newRating;
            if (serviceListing.reviews.length != 0 && serviceListing.overallRating != 0) {
                const currentTotalRating = serviceListing.reviews.length * serviceListing.overallRating
                newRating = (currentTotalRating + Number(payload.rating)) / (serviceListing.reviews.length + 1)
            } else {
                newRating = Number(payload.rating)
            }

            const newReview = await prisma.review.create({
                data: {
                    title: payload.title,
                    comment: payload.comment,
                    rating: Number(payload.rating),
                    attachmentKeys: payload.attachmentKeys,
                    attachmentURLs: payload.attachmentURLs,
                    orderItem: {
                        connect: {
                            orderItemId: Number(orderItemId)
                        }
                    },
                    serviceListing: {
                        connect: {
                            serviceListingId: serviceListingId
                        }
                    }
                }
            })
            await prisma.serviceListing.update({
                where: { serviceListingId },
                data: {
                    overallRating: newRating
                }
            })
            return newReview
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ReviewError(error)
        }
    }

    async updateReview(payload, reviewId) {
        try {

            const reviewToUpdate = await this.getReviewById(reviewId)
            const newRating = ((reviewToUpdate.serviceListing.overallRating * reviewToUpdate.serviceListing.reviews.length) - reviewToUpdate.rating + Number(payload.rating)) / (reviewToUpdate.serviceListing.reviews.length)

            const updateReview = await prisma.review.update({
                where: { reviewId: reviewId },
                data: {
                    title: payload.title,
                    comment: payload.comment,
                    rating: Number(payload.rating),
                    attachmentKeys: payload.attachmentKeys,
                    attachmentURLs: payload.attachmentURLs,
                    lastUpdated: new Date(),
                }
            })
            await prisma.serviceListing.update({
                where: { serviceListingId: reviewToUpdate.serviceListingId },
                data: {
                    overallRating: newRating
                }
            })
            return updateReview
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ReviewError(error)
        }
    }

    async deleteReview(reviewId) {
        try {

            const reviewToDelete = await this.getReviewById(reviewId)
            // update the overall rating
            const newRating = reviewToDelete.serviceListing.reviews.length == 1
                ? 0
                : ((reviewToDelete.serviceListing.overallRating * reviewToDelete.serviceListing.reviews.length) - reviewToDelete.rating) / (reviewToDelete.serviceListing.reviews.length - 1)
            await prisma.serviceListing.update({
                where: { serviceListingId: reviewToDelete.serviceListingId },
                data: {
                    overallRating: newRating
                }
            })
            await this.deleteFilesOfAReview(reviewId)
            await prisma.review.delete({
                where: { reviewId }
            })

        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ReviewError(error)
        }
    }

    async getReviewById(reviewId) {
        try {
            const review = await prisma.review.findUnique({
                where: { reviewId },
                include: {
                    serviceListing: {
                        include: {
                            reviews: true
                        }
                    },
                    orderItem: true
                }
            });
            if (!review) throw new CustomError("Review Record not found", 404)
            return review
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ReviewError(error)
        }
    }

    async hideReview(reviewId) {
        try {
            const reviewToHide = await this.getReviewById(reviewId)
            const updatedReview = await prisma.review.update({
                where: { reviewId: reviewId },
                data: {
                    isHidden: true
                }
            })
            return updatedReview
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ReviewError(error)
        }
    }

    async showReview(reviewId) {
        try {
            const reviewToHide = await this.getReviewById(reviewId)
            const updatedReview = await prisma.review.update({
                where: { reviewId: reviewId },
                data: {
                    isHidden: false
                }
            })
            return updatedReview
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ReviewError(error)
        }
    }

    async replyReview(reviewId, payload) {
        try {
            const reviewToHide = await this.getReviewById(reviewId)
            const updatedReview = await prisma.review.update({
                where: { reviewId: reviewId },
                data: {
                    reply: payload.reply
                }
            })
            return updatedReview
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ReviewError(error)
        }
    }

    async deleteFilesOfAReview(reviewId) {
        try {
            // delete images from S3
            const review = await prisma.review.findUnique({
                where: { reviewId },
            });
            if (!review) {
                throw new CustomError("Review not found", 404);
            }
            await s3ServiceInstance.deleteFiles(review.attachmentKeys);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new ReviewError(error);
        }
    };
}

module.exports = new ReviewService();