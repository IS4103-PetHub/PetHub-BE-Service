const prisma = require("../../../../prisma/prisma");
const CustomError = require("../../errors/customError");
const RefundRequestError = require("../../errors/refundRequestError");
const stripeService = require("../stripeService");
const orderItemService = require('./orderItemService')
// const { v4: uuidv4 } = require("uuid"); // uncomment to test without stripe service 
const emailService = require('../emailService')
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
                }
            });

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
            });
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
                stripeRefundId = refundData.id;
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
                });

                return updatedRefundRequest
            });

            return approvedRefundRequest;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new RefundRequestError(error);
        }
    };



}

module.exports = new RefundRequestService();

