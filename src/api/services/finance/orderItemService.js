
const prisma = require('../../../../prisma/prisma');
const petBusinessService = require('../../services/user/petBusinessService')
const petOwnerService = require('../../services/user/petOwnerService')
const CustomError = require('../../errors/customError')
const OrderItemsError = require('../../errors/orderItemError')
const { OrderItemStatus } = require('@prisma/client')
const emailService = require('../../services/emailService')
const emailTemplate = require('../../resource/emailTemplate');


class OrderItemService {
    constructor() { }

    async expireOrderItems(beforeDate = undefined) {
        try {
            const expireDate = beforeDate ? beforeDate : new Date();
            // Filter and update the order items
            const expiredOrderItems = await prisma.orderItem.updateMany({
                where: {
                    AND: [
                        { status: { in: [OrderItemStatus.PENDING_BOOKING, OrderItemStatus.PENDING_FULFILLMENT], }, },
                        { expiryDate: { lte: expireDate, }, },
                    ],
                },
                data: {
                    status: OrderItemStatus.EXPIRED,
                },
            });

            return expiredOrderItems;
        } catch (error) {
            console.log(error)
            if (error instanceof CustomError) throw error;
            throw new OrderItemsError(error);
        }
    }

    async getOrderItemById(orderItemId) {
        try {
            const orderItem = await prisma.orderItem.findUnique({
                where: { orderItemId: orderItemId },
                include: {
                    booking: true,
                    review: true,
                    serviceListing: {
                        include: {
                            tags: true,
                            addresses: true,
                            petBusiness: {
                                select: {
                                    companyName: true,
                                },
                            },
                        },
                    },
                    invoice: {
                        select: {
                            paymentId: true,
                            createdAt: true,
                            PetOwner: {
                                include: {
                                    user: {
                                        select: {
                                            email: true
                                        }
                                    }
                                }
                            }
                        },
                    },
                    review: true
                },
            });

            if (!orderItem) throw new CustomError("Order item not found", 404);
            return orderItem;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new OrderItemsError(error);
        }
    }

    async getAllOrderItems(
        statusFilterArray = undefined,
        startDate = undefined,
        endDate = undefined,
        serviceListingFilterArray = undefined,
        petBusinessFilter = undefined) {
        try {
            let orderItems = await prisma.orderItem.findMany({
                include: {
                    booking: true,
                    serviceListing: {
                        include: {
                            tags: true,
                            addresses: true,
                            petBusiness: {
                                select: {
                                    companyName: true,
                                },
                            },
                        },
                    },
                    invoice: {
                        select: {
                            paymentId: true,
                            createdAt: true,
                            PetOwner: {
                                include: {
                                    user: {
                                        select: {
                                            email: true
                                        }
                                    }
                                }
                            }
                        },
                    },
                    review: true
                },
            });

            const filters = {
                petBusinessFilter: petBusinessFilter,
                statusFilterArray: statusFilterArray,
                serviceListingFilterArray: serviceListingFilterArray,
                startDate: startDate,
                endDate: endDate,
            }

            if (statusFilterArray) orderItems = this.filterOrderItems(orderItems, filters);
            return orderItems;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new OrderItemsError(error);
        }
    }

    async getPetOwnerOrderItemsById(petOwnerId, statusFilterArray = undefined) {
        try {
            const petOwner = await petOwnerService.getUserById(petOwnerId);

            const invoices = await prisma.invoice.findMany({
                where: { petOwnerUserId: petOwner.userId },
                include: {
                    orderItems: {
                        include: {
                            booking: true,
                            serviceListing: {
                                include: {
                                    tags: true,
                                    addresses: true,
                                    petBusiness: {
                                        select: {
                                            companyName: true,
                                        },
                                    },
                                },
                            },
                            review: true
                        },
                    },
                    PetOwner: {
                        include: {
                            user: {
                                select: {
                                    email: true
                                }
                            }
                        }
                    }
                },
            });

            let orderItems = invoices.flatMap((invoice) => {
                return invoice.orderItems.map((orderItem) => ({
                    ...orderItem,
                    invoice: {
                        paymentId: invoice.paymentId, // attach paymentId from invoice too
                        createdAt: invoice.createdAt, // attach createdAt from invoice too
                        PetOwner: invoice.PetOwner,
                    },
                }));
            });

            const filters = {
                petBusinessFilter: undefined,
                statusFilterArray: statusFilterArray,
                serviceListingFilterArray: undefined,
                startDate: undefined,
                endDate: undefined
            }

            if (statusFilterArray) orderItems = this.filterOrderItems(orderItems, filters);

            return orderItems;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new OrderItemsError(error);
        }
    }

    async getPetBusinessOrderItemsById(
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
                    tags: true,
                    addresses: true,
                    OrderItem: {
                        include: {
                            booking: true,
                            invoice: {
                                select: {
                                    paymentId: true,
                                    createdAt: true,
                                    PetOwner: {
                                        include: {
                                            user: {
                                                select: {
                                                    email: true
                                                }
                                            }
                                        }
                                    }
                                },
                            },
                            review: true
                        },
                    },
                },
            });

            let orderItems = serviceListings.flatMap((serviceListing) =>
                serviceListing.OrderItem.map((orderItem) => {
                    return {
                        ...orderItem,
                        serviceListing: {
                            ...serviceListing,
                            OrderItem: undefined, // manually disconnect OrderItem from serviceListing
                        },
                    };
                })
            );

            const filters = {
                petBusinessFilter: undefined,
                statusFilterArray: statusFilterArray,
                serviceListingFilterArray: serviceListingFilterArray,
                startDate: startDate,
                endDate: endDate
            }

            const filteredOrderItems = this.filterOrderItems(orderItems, filters)


            filteredOrderItems.sort((a, b) => {
                const dateA = new Date(a.invoice.createdAt);
                const dateB = new Date(b.invoice.createdAt);
                return dateA - dateB;
            });

            return filteredOrderItems;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new OrderItemsError(error);
        }
    }

    async completeOrderItem(orderItemId, userId, voucherCode) {
        try {
            const orderItem = await prisma.orderItem.findUnique({
                where: { orderItemId: orderItemId },
                include: {
                    serviceListing: {
                        include: {
                            petBusiness: {
                                select: {
                                    companyName: true,
                                    businessEmail: true,
                                },
                            },
                        },
                    },
                    invoice: {
                        include: {
                            PetOwner: {
                                include: {
                                    user: {
                                        select: {
                                            userId: true,
                                            email: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (!orderItem) throw new CustomError("Order item not found", 404);

            // Verify that user is the one who purchased this orderItem
            if (orderItem.invoice.PetOwner.user.userId != userId) {
                throw new CustomError("User error - UserId does not match user who purchased this Order Item", 400);
            }

            // Verify that the orderItem has not been fulfilled yet
            if (orderItem.status !== OrderItemStatus.PENDING_FULFILLMENT) {
                throw new CustomError(`Order Item cannot be fulfiled. Order Item status ${orderItem.status}`, 400);
            }

            // Verify that voucher code is correct
            if (orderItem.voucherCode !== voucherCode) {
                throw new CustomError("Invalid voucher code", 400);
            }

            // The voucher code matches; update the status to "FULFILLED" and update dateFulfilled to today's date
            const updatedOrderItem = await prisma.orderItem.update({
                where: { orderItemId: orderItemId },
                data: {
                    status: "FULFILLED",
                    dateFulfilled: new Date(),
                },
            });

            // Send email to PO and PB that order has been fulfilled
            // For PB, email is sent to the PB's businessEmail
            await emailService.sendEmail(
                orderItem.invoice.PetOwner.user.email,
                `${orderItem.invoice.PetOwner.firstName}, Your PetHub Order Has Been Fulfilled!`,
                emailTemplate.POVoucherFulfillmentEmail(orderItem));

            await emailService.sendEmail(
                orderItem.serviceListing.petBusiness.businessEmail,
                `${orderItem.serviceListing.petBusiness.companyName}, A PetHub Order Has Been Fulfilled!`,
                emailTemplate.PBVoucherFulfillmentEmail(orderItem));

            return updatedOrderItem;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new OrderItemsError(error)
        }
    }

    filterOrderItems(orderItems, filters) {
        const {
            petBusinessFilter,
            statusFilterArray,
            serviceListingFilterArray,
            startDate,
            endDate,
        } = filters;

        const statusFilter = new Set(statusFilterArray);
        const serviceListingFilter = new Set(serviceListingFilterArray);

        return orderItems.filter((orderItem) => {
            const createdAt = new Date(orderItem.invoice.createdAt);

            // Apply petBusiness filter if provided
            if (petBusinessFilter && orderItem.serviceListing.petBusinessId != petBusinessFilter) {
                return false;
            }

            // Apply status filter if provided
            if (statusFilterArray && !statusFilter.has(orderItem.status)) {
                return false;
            }

            // Apply service listing filter if provided
            if (serviceListingFilterArray && !serviceListingFilter.has(orderItem.serviceListingId.toString())) {
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

module.exports = new OrderItemService();
