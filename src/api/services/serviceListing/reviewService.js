const prisma = require('../../../../prisma/prisma');
const CustomError = require('../../errors/customError');
const ReviewError = require('../../errors/reviewError')
const orderItemService = require("../finance/orderItemService");
const serviceListingService = require("../serviceListing/serviceListingService")
const s3ServiceInstance = require("../s3Service");
const service = require('studio/src/service');
const emailService = require('../emailService');
const emailTemplate = require('../../resource/emailTemplate');

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
            dateCreated.setDate(dateCreated.getDate() + 15);
            if (new Date() > dateCreated) {
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
            dateCreated.setDate(dateCreated.getDate() + 15);
            if (new Date() > dateCreated) {
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
            dateCreated.setDate(dateCreated.getDate() + 15);
            if (new Date() > dateCreated && callee.accountType != "INTERNAL_USER") {
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

            if (callee.accountType == "INTERNAL_USER") {
                const POname = reviewToDelete.orderItem.invoice.PetOwner.lastName;
                const PBname = reviewToDelete.serviceListing.petBusiness.companyName;
                const POemail = reviewToDelete.orderItem.invoice.PetOwner.user.email;
                const PBemail = reviewToDelete.serviceListing.petBusiness.user.email;
                // send email to PO
                await emailService.sendEmail(
                    POemail,
                    "PetHub: Your Review has been removed",
                    emailTemplate.AdminDeleteReviewToReviewer(POname, reviewToDelete)
                )

                // send email to PB
                await emailService.sendEmail(
                    PBemail,
                    "PetHub: Review Removed for Your Service Listing",
                    emailTemplate.AdminDeleteReviewToBusiness(PBname, reviewToDelete)
                )
            }
            
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
                            reviews: true,
                            petBusiness: {
                                include: {
                                    user: {
                                        select: {
                                            userId: true,
                                            email: true,
                                            accountType: true,
                                            accountStatus: true,
                                        },
                                    },
                                },
                            }
                        }
                    },
                    orderItem: {
                        include: {
                            invoice: {
                                include: {
                                    PetOwner: {
                                        include: {
                                            user: {
                                                select: {
                                                    userId: true,
                                                    email: true,
                                                    accountType: true,
                                                    accountStatus: true,
                                                },
                                            },
                                        },
                                    }
                                }
                            }
                        }
                    },
                    reportedBy: {
                        include: {
                            reportedBy: true,
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

            
            const POemail = reviewToReply.orderItem.invoice.PetOwner.user.email;
            const POname = reviewToReply.orderItem.invoice.PetOwner.lastName;
            // send email to PO
            await emailService.sendEmail(
                POemail,
                `PetHub: Response to Your Review on ${reviewToReply.serviceListing.title}`,
                emailTemplate.PBReplysReview(POname, reviewToReply.serviceListing.title, payload.reply)
            )

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

            return { liked: !likedByPetOwner };
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

    async generateAverageReviewData(serviceListingId, monthsBack = 6) {
        try {
            const currentDate = new Date();
            currentDate.setDate(1);
            const sixMonthsAgo = new Date(currentDate.setMonth(currentDate.getMonth() - monthsBack));
    
            // Fetch reviews in the last 6 months
            const reviews = await prisma.review.findMany({
                where: {
                    serviceListingId: serviceListingId,
                    dateCreated: {
                        gte: sixMonthsAgo,
                    },
                },
            });
    
            if (reviews.length === 0) {
                throw new CustomError("No reviews found", 404);
            }
    
            const monthlyRatings = new Map();
    
            // Store n compute sums and counts into map
            const result = reviews.reduce((acc, review) => {
                const month = review.dateCreated.toLocaleString('default', { month: 'short' }); // Get out the short form month
                const ratingData = acc.get(month) || { sum: 0, count: 0 };
                ratingData.sum += review.rating;
                ratingData.count += 1;
                acc.set(month, ratingData);
                return acc;
            }, monthlyRatings);
            
            // FE lib expects list of list, first list is the header
            return [
                ["Month", "Average rating"],
                ...Array.from(result)
                  .sort((a, b) => this.monthToNumber(a[0]) - this.monthToNumber(b[0])) // Sort by month number
                  .map(([month, { sum, count }]) => [month, sum / count]),
              ];
    
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new ReviewError(error);
        }
    }


    async generateRatingCountDistributionData(serviceListingId, monthsBack = 6) {
        try {
            const currentDate = new Date();
            currentDate.setDate(1);
            const sixMonthsAgo = new Date(currentDate.setMonth(currentDate.getMonth() - monthsBack));
    
            const reviews = await prisma.review.findMany({
                where: {
                    serviceListingId,
                    dateCreated: { gte: sixMonthsAgo },
                },
            });
    
            if (reviews.length === 0) {
                throw new CustomError("No reviews found", 404);
            }
    
            const ratingsDistribution = new Map();
    
            reviews.forEach((review) => {
                const month = review.dateCreated.toLocaleString('default', { month: 'short' }); // Get out the short form month
                const monthData = ratingsDistribution.get(month) || { "5 Paw": 0, "4 Paw": 0, "3 Paw": 0, "2 Paw": 0, "1 Paw": 0 };
                
                switch (review.rating) {
                    case 5: monthData["5 Paw"]++; break;
                    case 4: monthData["4 Paw"]++; break;
                    case 3: monthData["3 Paw"]++; break;
                    case 2: monthData["2 Paw"]++; break;
                    case 1: monthData["1 Paw"]++; break;
                }
    
                ratingsDistribution.set(month, monthData);
            });
            
            // FE lib expects list of list, first list is the header
            return [
                ["Month", "5 Paw", "4 Paw", "3 Paw", "2 Paw", "1 Paw"],
                ...Array.from(ratingsDistribution)
                  .sort((a, b) => this.monthToNumber(a[0]) - this.monthToNumber(b[0])) // Sort by month number
                  .map(([month, data]) => [
                    month, data["5 Paw"], data["4 Paw"], data["3 Paw"], data["2 Paw"], data["1 Paw"]
                  ]),
              ];
    
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new ReviewError(error);
        }
    }


    async generateRatingCountData(serviceListingId, monthsBack = 6) {
        try {
            const currentDate = new Date();
            currentDate.setDate(1);
            const sixMonthsAgo = new Date(currentDate.setMonth(currentDate.getMonth() - monthsBack));
    
            const reviews = await prisma.review.findMany({
                where: {
                    serviceListingId,
                    dateCreated: { gte: sixMonthsAgo },
                },
            });
    
            if (reviews.length === 0) {
                throw new CustomError("No reviews found", 404);
            }
    
            const ratingCounts = { "5 Paw": 0, "4 Paw": 0, "3 Paw": 0, "2 Paw": 0, "1 Paw": 0 };
    
            reviews.forEach((review) => {
                switch (review.rating) {
                    case 5: ratingCounts["5 Paw"]++; break;
                    case 4: ratingCounts["4 Paw"]++; break;
                    case 3: ratingCounts["3 Paw"]++; break;
                    case 2: ratingCounts["2 Paw"]++; break;
                    case 1: ratingCounts["1 Paw"]++; break;
                }
            });
    
            // FE lib expects list of list, first list is the header
            return [
                ["Rating", "Count"],
                ...Object.entries(ratingCounts).map(([rating, count]) => [`${rating} (${count})`, count]), // also put count in bracket string
            ];
    
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new ReviewError(error);
        }
    }

    monthToNumber(month) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthNames.indexOf(month);
    }
}

module.exports = new ReviewService();