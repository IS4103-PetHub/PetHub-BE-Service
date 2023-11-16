const prisma = require("../../../../prisma/prisma");
const CustomError = require("../../errors/customError");
const RefundRequestError = require("../../errors/refundRequestError");
const stripeService = require("../stripeService");
const orderItemService = require('./orderItemService')
// const { v4: uuidv4 } = require("uuid"); // uncomment to test without stripe service 
const emailService = require('../emailService')
const petBusinessService = require('../../services/user/petBusinessService')
const emailTemplate = require('../../resource/emailTemplate');
const { OrderItemStatus, RefundStatus } = require('@prisma/client');
const transactionConstants = require('../../../constants/transactions');

class RefundRequestService {
    constructor() { }

    async getRefundRequestById(refundRequestId) {
        try {
            const refundRequest = await prisma.refundRequest.findUnique({
                where: { refundRequestId: refundRequestId },
                include: {
                    petBusiness: true,
                    petOwner: true,
                    orderItem: true
                }
            })

            if (!refundRequest) throw new CustomError("Refund request not found", 404);

            return refundRequest
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new RefundRequestError(error);
        }
    }


    async getRefundRequestByPetBusinessId(
        petBusinessId,
        statusFilterArray = undefined,
        startDate = undefined,
        endDate = undefined,
        serviceListingFilterArray = undefined
    ) {
        try {
            const petBusiness = await petBusinessService.getUserById(petBusinessId);

            const serviceListings = await prisma.serviceListing.findMany({
                where: { petBusinessId: petBusiness.userId },
                include: {
                    OrderItem: {
                        include: {
                            RefundRequest: {
                                include: {
                                    petBusiness: true,
                                    petOwner: true,
                                }
                            }
                        }
                    }
                },
            });

            let refundRequests = serviceListings.flatMap((serviceListing) =>
                serviceListing.OrderItem.flatMap((orderItem) =>
                    orderItem.RefundRequest ? [{
                        ...orderItem.RefundRequest,
                        orderItem: {
                            ...orderItem,
                            RefundRequest: undefined, // remove cyclic dependency
                        },
                        serviceListing: {
                            ...serviceListing,
                            OrderItem: undefined, // remove cyclic dependency
                        }
                    }] : []
                )
            );

            const filters = {
                petBusinessFilter: undefined,
                statusFilterArray: statusFilterArray,
                serviceListingFilterArray: serviceListingFilterArray,
                startDate: startDate,
                endDate: endDate
            }

            const filteredRefundRequests = this.filterRefundRequests(refundRequests, filters)


            filteredRefundRequests.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateA - dateB;
            });

            const statusPriority = {
                PENDING: 1, // Highest priority
                REJECTED: 2,
                APPROVED: 3,
            };

            // Sort the filtered refund requests by status and then by created date
            filteredRefundRequests.sort((a, b) => {
                const priorityA = statusPriority[a.status] || 0;
                const priorityB = statusPriority[b.status] || 0;
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
                // if same status
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateA - dateB;
            });

            return filteredRefundRequests;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new RefundRequestError(error);
        }
    }


    async createRefundRequest(data) {
        try {
            const orderItem = await orderItemService.getOrderItemById(Number(data.orderItemId))

            if (!(orderItem.status == OrderItemStatus.PENDING_BOOKING
                || orderItem.status == OrderItemStatus.PENDING_FULFILLMENT
                || orderItem.status == OrderItemStatus.FULFILLED)) {
                throw new CustomError(`Order Item cannot be refunded. Order is in ${orderItem.status} state`, 400);
            }

            if (orderItem.status === OrderItemStatus.FULFILLED) {
                const lastEligibleRefundDate = orderItem.dateFulfilled;
                lastEligibleRefundDate.setDate(lastEligibleRefundDate.getDate() + transactionConstants.HOLDING_PERIOD);
                const currentDate = new Date()
                if (currentDate >= lastEligibleRefundDate) {
                    throw new CustomError(`Order Item cannot be refunded, it has been more than ${transactionConstants.HOLDING_PERIOD} days since the order was fulfilled!`, 400);
                }
            }


            // 2. Create a new refund request with status as PENDING
            const newRefundRequest = await prisma.refundRequest.create({
                data: {
                    orderItemId: orderItem.orderItemId,
                    petOwnerId: orderItem.invoice.PetOwner.userId,
                    petBusinessId: orderItem.serviceListing.petBusinessId,
                    reason: data.reason,
                    status: 'PENDING',
                },
                include: {
                    orderItem: true,
                    petBusiness: {
                        select: {
                            companyName: true,
                            user: {
                                select: {
                                    email: true,
                                }
                            }
                        }
                    }
                },
            });

            await emailService.sendEmail(
                newRefundRequest.petBusiness.user.email,
                `${newRefundRequest.petBusiness.companyName}, Refund Request Made`,
                emailTemplate.RefundRequestCreatedEmail(newRefundRequest));

            return newRefundRequest;
        } catch (error) {
            console.error("Error during checkout:", error);
            if (error instanceof CustomError) throw error;
            throw new RefundRequestError(error);
        }
    };


    async cancelRefundRequest(refundRequestId) {
        try {
            const refundRequest = await this.getRefundRequestById(refundRequestId)

            if (refundRequest.status != RefundStatus.PENDING) {
                throw new CustomError(`Refund request cannot be cancelled as it is in ${refundRequest.status} state`, 400);
            }

            const deletedRefundRequest = await prisma.refundRequest.delete({
                where: {
                    refundRequestId: refundRequestId
                }
            });
            return deletedRefundRequest;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new RefundRequestError(error);
        }
    };

    async rejectRefundRequest(refundRequestId, data) {
        try {
            const refundRequest = await this.getRefundRequestById(refundRequestId)

            if (refundRequest.status != RefundStatus.PENDING) {
                throw new CustomError(`Refund request cannot be rejected as it is in ${refundRequest.status} state`, 400);
            }

            const updatedRefundRequest = await prisma.refundRequest.update({
                where: {
                    refundRequestId: refundRequestId
                },
                data: {
                    status: RefundStatus.REJECTED,
                    comment: data.comment,
                    processedAt: new Date(),
                },
                include: {
                    orderItem: true,
                    petOwner: {
                        select: {
                            lastName: true,
                            user: {
                                select: {
                                    email: true,
                                }
                            }
                        },
                    },
                },
            });

            await emailService.sendEmail(
                updatedRefundRequest.petOwner.user.email,
                `Refund Request Rejected`,
                emailTemplate.RefundRequestRejectedEmail(updatedRefundRequest));

            return updatedRefundRequest;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new RefundRequestError(error);
        }
    };


    async approveRefundRequest(refundRequestId, data) {
        try {
            const refundRequest = await this.getRefundRequestById(refundRequestId);
            let stripeRefundId = null;

            if (refundRequest.status != RefundStatus.PENDING) {
                throw new CustomError(`Refund request cannot be approved as it is in ${refundRequest.status} state`, 400);
            }

            const orderItem = await orderItemService.getOrderItemById(refundRequest.orderItemId)
            // If price is 0, immediately refund without using Stripe
            if (orderItem.itemPrice != 0) {
                const refundData = await stripeService.issuePartialRefund(orderItem.invoice.paymentId, orderItem.itemPrice)
                // Commented out propagation of error in issuePartialRefund then mock the stripRefundId for seeded orders (refundData will be undefined)
                // TODO: Revert changes before submitting code 
                stripeRefundId = refundData ? refundData.id : `Mock stripe refund-${refundRequest.refundRequestId}`;
            }

            const approvedRefundRequest = await prisma.$transaction(async (prismaClient) => {
                const updatedRefundRequest = await prisma.refundRequest.update({
                    where: {
                        refundRequestId: refundRequestId
                    },
                    data: {
                        status: RefundStatus.APPROVED,
                        comment: data.comment,
                        stripeRefundId: stripeRefundId,
                        processedAt: new Date(),
                    },
                    include: {
                        orderItem: true,
                        petOwner: {
                            select: {
                                lastName: true,
                                user: {
                                    select: {
                                        email: true,
                                    }
                                }
                            },
                        },
                    },
                });
                return updatedRefundRequest
            });

            await emailService.sendEmail(
                approvedRefundRequest.petOwner.user.email,
                `Refund Request Approved`,
                emailTemplate.RefundRequestApprovedEmail(approvedRefundRequest));

            return approvedRefundRequest;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new RefundRequestError(error);
        }
    };

    filterRefundRequests(refundRequests, filters) {
        const {
            petBusinessFilter,
            statusFilterArray,
            serviceListingFilterArray,
            startDate,
            endDate,
        } = filters;

        const statusFilter = new Set(statusFilterArray);
        const serviceListingFilter = new Set(serviceListingFilterArray);

        return refundRequests.filter((refundRequest) => {
            const createdAt = new Date(refundRequest.createdAt);

            // Apply petBusiness filter if provided
            if (petBusinessFilter && refundRequest.serviceListing.petBusinessId != petBusinessFilter) {
                return false;
            }

            // Apply status filter if provided
            if (statusFilterArray && !statusFilter.has(refundRequest.status)) {
                return false;
            }

            // Apply service listing filter if provided
            if (serviceListingFilterArray && !serviceListingFilter.has(refundRequest.serviceListing.serviceListingId.toString())) {
                return false;
            }

            // Apply date range filter if provided
            if (startDate && endDate && (createdAt < new Date(startDate) || createdAt > new Date(endDate))) {
                return false;
            }

            // If all filters pass, keep the order item
            return true;
        });
    }
}

module.exports = new RefundRequestService();

