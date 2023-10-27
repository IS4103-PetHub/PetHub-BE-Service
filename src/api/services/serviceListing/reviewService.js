const prisma = require('../../../../prisma/prisma');
const CustomError = require('../../errors/customError');
const ReviewError = require('../../errors/reviewError')
const orderItemService = require("../finance/orderItemService");
const serviceListingService = require("../serviceListing/baseServiceListing")
const s3ServiceInstance = require("../s3Service");
const service = require('studio/src/service');

class ReviewService {

    async createReview(payload, orderItemId, callee) {
        try {

            const orderItem = await orderItemService.getOrderItemById(Number(orderItemId));
            if (orderItem.review) {
                throw new CustomError("orderItem already has a review", 400)
            }
            if (callee.userId != orderItem.invoice.PetOwner.userId) {
                throw new CustomError("Review can only be created by orderItem Owner", 400)
            }
            if (!orderItem.dateFulfilled) {
                throw new CustomError("Review can only be created after order is fulfilled", 400)
            }
            const dateCreated = new Date(orderItem.dateFulfilled)
            if (dateCreated > new Date().setDate(dateCreated + 15)) {
                throw new CustomError("Unable to create review after 15 days since order fulfilled", 400)
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

    async updateReview(payload, reviewId, callee) {
        try {

            const reviewToUpdate = await this.getReviewById(reviewId)
            if (callee.userId != reviewToUpdate.orderItem.invoice.petOwnerUserId) {
                throw new CustomError("Review can only be updated by orderItem Owner", 400)
            }
            const dateCreated = new Date(reviewToUpdate.dateCreated)
            if (dateCreated > new Date().setDate(dateCreated + 15)) {
                throw new CustomError("Unable to update review after 15 days since review is created", 400)
            }
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

    async deleteReview(reviewId, callee) {
        try {

            const reviewToDelete = await this.getReviewById(reviewId)
            if (callee.userId != reviewToDelete.orderItem.invoice.petOwnerUserId && callee.accountType != "INTERNAL_USER") {
                throw new CustomError("Review can only be deleted by orderItem Owner or Administrator", 400)
            }
            const dateCreated = new Date(reviewToDelete.dateCreated)
            if (dateCreated > new Date().setDate(dateCreated + 15)) {
                throw new CustomError("Unable to delete review after 15 days since review is created", 400)
            }
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
            console.log(error)
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
                    orderItem: {
                        include: {
                            invoice: true
                        }
                    },
                    reportedBy: {
                        include: {
                            reportedBy: true
                        }
                    },
                    likedBy: true
                }
            });
            if (!review) throw new CustomError("Review Record not found", 404)
            return review
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ReviewError(error)
        }
    }

    async replyReview(reviewId, payload, callee) {
        try {
            const reviewToReply = await this.getReviewById(reviewId)
            if (callee.userId != reviewToReply.serviceListing.petBusinessId) {
                throw new CustomError("Review can only be replied by petBusiness", 400)
            }
            const updatedReview = await prisma.review.update({
                where: { reviewId: reviewId },
                data: {
                    reply: payload.reply,
                    replyDate: new Date()
                }
            })
            return updatedReview
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ReviewError(error)
        }
    }

    async toggleLikedReview(reviewId, callee) {
        try {
            const likedReview = await this.getReviewById(reviewId)
            const likedByPetOwner = (likedReview.likedBy.length == 0)
                ? false
                : await likedReview.likedBy.find((petOwner) => petOwner.userId == callee.userId);
            if (likedByPetOwner) {
                const updatedReview = await prisma.review.update({
                    where: { reviewId: reviewId },
                    data: {
                        likedBy: {
                            disconnect: {
                                userId: callee.userId
                            }
                        }
                    }
                })
            } else {
                const updatedReview = await prisma.review.update({
                    where: { reviewId: reviewId },
                    data: {
                        likedBy: {
                            connect: {
                                userId: callee.userId,
                            },
                        },
                    },
                });
            }
            const updatedReviewWithLikedBy = await prisma.review.findUnique({
                where: { reviewId: reviewId },
                include: {
                    likedBy: true,
                },
            });

            return { liked: likedByPetOwner !== false }; // Done this way as likedByPetOwner above can only be either false or a petOwner object
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ReviewError(error)
        }
    }

    async reportReview(reviewId, callee, reportReason) {
        try {
            const existingReport = await prisma.reportReview.findFirst({
                where: {
                    reviewId: reviewId,
                    petOwnerId: callee.userId,
                },
            });

            if (existingReport) {
                throw new CustomError("You've already reported this review.", 400);
            }

            // Create a new report in the ReportReview table
            const newReport = await prisma.reportReview.create({
                data: {
                    reviewId: reviewId,
                    petOwnerId: callee.userId,
                    reportReason: reportReason,
                },
            });

            return newReport;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ReviewError(error);
        }
    }

    async resolveReview(reviewId, callee) {
        try {

            if (callee.accountType != "INTERNAL_USER") {
                throw new CustomError("You don't have permission to resolve review.", 400);
            }
            const existingReport = await prisma.reportReview.findFirst({
                where: {
                    reviewId: reviewId
                },
            });

            if (!existingReport) {
                throw new CustomError("Review Report not found.", 400);
            }

            await prisma.reportReview.deleteMany({
                where: {
                    reviewId: reviewId,
                },
            });

        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ReviewError(error);
        }
    }

    async getAllReportedReviews() {
        try {
            const reviews = await prisma.review.findMany({
                where: {
                    reportedBy: {
                        some: {},
                    },
                },
                include: {
                    reportedBy: true,
                    serviceListing: {
                        include: {
                            petBusiness: true
                        }
                    },
                    orderItem: {
                        include: {
                            invoice: {
                                include: {
                                    PetOwner: true
                                }
                            }
                        }
                    }
                }
            });
            reviews.sort((a, b) => b.reportedBy.length - a.reportedBy.length);
            return reviews;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new ReviewError(error);
        }
    }

    async getLikedAndReportedReview(serviceListingId, callee) {
        if (callee.accountType != "PET_OWNER") {
            throw new CustomError("You don't have permission to get the list of liked and reported review.", 400);
        }
    
        const likedList = await prisma.serviceListing.findUnique({
            where: { serviceListingId },
            select: {
                reviews: {
                    where: {
                        likedBy: {
                            some: {
                                userId: {
                                    equals: callee.userId
                                }
                            }
                        }
                    }
                }
            }
        });

        const reportedList = await prisma.serviceListing.findUnique({
            where: { serviceListingId },
            select: {
                reviews: {
                    where: {
                        reportedBy: {
                            some: {
                                petOwnerId: callee.userId
                            }
                        }
                    },
                }
            }
        });

        const filteredLikedBy = likedList.reviews.map(review => review.reviewId);
        const filteredReportedBy = reportedList.reviews.map(review => review.reviewId);

    
        return {
            likesBy: filteredLikedBy,
            reportsBy: filteredReportedBy
        };
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