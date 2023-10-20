
const transactionConstants = require("../../../constants/transactions");
const stripeService = require('../stripeService')
const { v4: uuidv4 } = require("uuid"); // uncomment to test without stripe service 
const prisma = require('../../../../prisma/prisma');
const petBusinessService = require('../../services/user/petBusinessService')
const CustomError = require('../../errors/customError')
const OrderItemsError = require('../../errors/orderItemError')
const { OrderItemStatus } = require('@prisma/client')

class RevenueService {
    async getEligiblePayoutOI(inputPayoutDate = undefined) {
        try {
            // Define the payout date, defaulting to the current date if not provided
            const payoutDate = inputPayoutDate ? new Date(inputPayoutDate) : new Date();

            // Fetch the expired order items before or equal payout date
            const expiredOrderItems = await prisma.orderItem.findMany({
                where: {
                    AND: [
                        { status: OrderItemStatus.EXPIRED },
                        { expiryDate: { lte: payoutDate } }
                    ]
                },
                include: {
                    serviceListing: {
                        include: {
                            petBusiness: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    }
                }
            });

            // Calculate the payout date for fulfilled orders
            const fulfilledPayoutDate = new Date(payoutDate);
            fulfilledPayoutDate.setDate(payoutDate.getDate() - transactionConstants.HOLDING_PERIOD);

            // Fetch the fulfilled order items before or equal payout date - holding period
            const fulfilledOrderItems = await prisma.orderItem.findMany({
                where: {
                    AND: [
                        { status: OrderItemStatus.FULFILLED },
                        { dateFulfilled: { lte: fulfilledPayoutDate, } }
                    ]
                },
                include: {
                    serviceListing: {
                        include: {
                            petBusiness: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    }
                }
            });

            const orderItems = expiredOrderItems.concat(fulfilledOrderItems);
            return orderItems;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new OrderItemsError(error);
        }
    }

    buildPayoutInvoice(orderItems = []) {
        const pbTOOIMapping = orderItems.reduce((acc, orderItem) => {
            const pbId = orderItem.serviceListing.petBusinessId
            if (!acc[pbId]) {
                acc[pbId] = {
                    userId: pbId,
                    orderItems: [],
                    totalAmount: 0,
                    commissionCharge: 0,
                    paidOutAmount: 0
                }
            }

            acc[pbId].orderItems.push(orderItem.orderItemId)
            const itemPrice = orderItem.itemPrice
            const commissionCharge = orderItem.itemPrice * orderItem.commissionRate
            acc[pbId].totalAmount += itemPrice
            acc[pbId].commissionCharge += commissionCharge
            acc[pbId].paidOutAmount += itemPrice - commissionCharge
            return acc;
        }, {})

        const payoutInvoices = Object.values(pbTOOIMapping);
        for (const payoutInvoice of payoutInvoices) {
            payoutInvoice.totalAmount = parseFloat(payoutInvoice.totalAmount.toFixed(2)); // convert to 2 dp
            payoutInvoice.commissionCharge = parseFloat(payoutInvoice.commissionCharge.toFixed(2)); // convert to 2 dp
            payoutInvoice.paidOutAmount = parseFloat(payoutInvoice.paidOutAmount.toFixed(2)); // convert to 2 dp
        }

        return payoutInvoices
    }


    async processPayout(petBusiness, payoutInvoice) {
        const paymentMethodId = 'pm_card_visa' // TODO: remove if unecessary
        const fromEmail = transactionConstants.PETHUB_STRIPE_HOLDING_ACCT_EMAIL // TODO: remove if unnecessary
        const toEmail = petBusiness.user.email // TODO: use PB stripe account? 
        // TODO: replace uuid with stripeService....
        const paymentIntentId = uuidv4(); // uncomment to test without stripe
        payoutInvoice.paymentId = paymentIntentId

        return payoutInvoice
    }


    async createPayoutInvoice(payoutInvoiceData, petBusinessId) {
        try {
            const payoutInvoice = await prisma.$transaction(async (prismaClient) => {
                for (const orderItemId of payoutInvoiceData.orderItems) {
                    await prismaClient.orderItem.update({
                        where: { orderItemId: orderItemId },
                        data: { status: OrderItemStatus.PAID_OUT }
                    })
                }

                const createdInvoice = prismaClient.payoutInvoice.create({
                    data: {
                        totalAmount: payoutInvoiceData.totalAmount,
                        commissionCharge: payoutInvoiceData.commissionCharge,
                        paidOutAmount: payoutInvoiceData.paidOutAmount,
                        paymentId: payoutInvoiceData.paymentId,
                        userId: payoutInvoiceData.userId,
                        orderItems: {
                            connect: payoutInvoiceData.orderItems.map(orderItemId => ({ orderItemId: orderItemId })),
                        },
                    },
                    include: {
                        orderItems: true
                    }
                });
                return createdInvoice
            })

            return payoutInvoice;
        } catch (error) {
            console.error(error);
            throw error; // You might want to handle this error more gracefully in a real application.
        }
    }


    async payoutOrderItems(inputPayoutDate = undefined) {
        try {
            const toPayout = await this.getEligiblePayoutOI(inputPayoutDate)
            const payoutInvoices = this.buildPayoutInvoice(toPayout)

            const completedPayoutInvoices = []
            for (const payoutInvoice of payoutInvoices) {
                const petBusiness = await petBusinessService.getUserById(payoutInvoice.userId)
                const processedPayoutInvoice = await this.processPayout(petBusiness, payoutInvoice)
                const createdPayoutInvoice = await this.createPayoutInvoice(processedPayoutInvoice, petBusiness.userId)

                completedPayoutInvoices.push(createdPayoutInvoice)
                // generate email 
            }

            return completedPayoutInvoices;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new OrderItemsError(error);
        }
    }
}

module.exports = new RevenueService();
