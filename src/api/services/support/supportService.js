const prisma = require("../../../../prisma/prisma");
const CustomError = require("../../errors/customError");
const SupportTicketError = require("../../errors/supportTicketError")
const petOwnerService = require("../user/petOwnerService")
const petBusinessService = require("../user/petBusinessService");
const { baseUserServiceInstance } = require("../user/baseUserService");
const { SupportTicketStatus } = require('@prisma/client')

class SupportService {
    async createPOSupportTicket(petOwnerId, data) {
        try {
            const petOwner = await petOwnerService.getUserById(petOwnerId)

            // validate if SL exists
            if(data.serviceListingId) {
                const serviceListing = await prisma.serviceListing.findUnique({
                    where: {serviceListingId: Number(data.serviceListingId)}
                })
            }

            // validate if PO owns the orderitem
            if(data.orderItemId) {
                const orderItem = await prisma.orderItem.findUnique({
                    where: {orderItemId: Number(data.orderItemId)},
                    include: {
                        invoice: true
                    }
                })
                if (orderItem.invoice.petOwnerUserId != petOwnerId) {
                    throw new CustomError("Unable to create support ticket for an orderItem that do not belong to the user", 400)
                }
            }

            // validate if PO owns the booking
            if(data.bookingId) {
                const booking = await prisma.booking.findUnique({
                    where: {bookingId: Number(data.bookingId)}
                })
                if(booking.petOwnerId != petOwnerId) {
                    throw new CustomError("Unable to create support ticket for a booking that do not belong to the user", 400)
                }
            }


            // validate if PO owns the refundRequests
            if(data.refundRequestId) {
                const refundRequest = await prisma.refundRequest.findUnique({
                    where: {refundRequestId: Number(data.refundRequestId)}
                })
                if(refundRequest.petOwnerId != petOwnerId) {
                    throw new CustomError("Unable to create support ticket for a refund request that do not belong to the user", 400)
                }
            }

            // validate if PO owns the invoice
            if(data.invoiceId) {
                const invoice = await prisma.invoice.findUnique({
                    where: {invoiceId: Number(data.invoiceId)}
                })
                if(invoice.petOwnerUserId != petOwnerId) {
                    throw new CustomError("Unable to create support ticket for a invoice that do not belong to the user", 400)
                }
            }


            const supportTicket = await prisma.supportTicket.create({
                data: {
                    reason: data.reason,
                    attachmentKeys: data.attachmentKeys,
                    attachmentURLs: data.attachmentURLs,
                    supportCategory: data.supportCategory,
                    priority: data.priority,
                    petOwner: {
                        connect: {
                            userId: petOwner.userId
                        }
                    },
                    // Connect serviceListingId if it exists
                    ...(data.serviceListingId && {
                        serviceListing: {
                            connect: { serviceListingId: parseInt(data.serviceListingId, 10) },
                        },
                    }),
                    // Connect orderItemId if it exists
                    ...(data.orderItemId && {
                        orderItem: {
                            connect: { orderItemId: parseInt(data.orderItemId, 10) },
                        },
                    }),
                    // Connect bookingId if it exists
                    ...(data.bookingId && {
                        booking: {
                            connect: { bookingId: parseInt(data.bookingId, 10) },
                        },
                    }),
                    // Connect refundRequestId if it exists
                    ...(data.refundRequestId && {
                        refundRequest: {
                            connect: { refundRequestId: parseInt(data.refundRequestId, 10) },
                        },
                    }),
                    // Connect Invoice if it exists
                    ...(data.invoiceId && {
                        invoice: {
                            connect: { invoiceId: parseInt(data.invoiceId, 10) },
                        },
                    }),
                },
                include: {
                    petOwner: true,
                }
            })
            return supportTicket
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new SupportTicketError(error);
        }
    }

    async createPBSupportTicket(petBusinessId, data) {
        try {
            const petBusiness = await petBusinessService.getUserById(petBusinessId)

            // validate if PB owns the SL
            if(data.serviceListingId) {
                const serviceListing = await prisma.serviceListing.findUnique({
                    where: {serviceListingId: Number(data.serviceListingId)}
                })
                if(serviceListing.petBusinessId != petBusinessId) {
                    throw new CustomError("Unable to create support ticket for a Service Listing that do not belong to the user", 400)
                }
            }

            // validate if orderItem is under the PBs SL
            if(data.orderItemId) {
                const orderItem = await prisma.orderItem.findUnique({
                    where: {orderItemId: Number(data.orderItemId)},
                    include: {
                        serviceListing: true
                    }
                })
                if (orderItem.serviceListing.petBusinessId != petBusinessId) {
                    throw new CustomError("Unable to create support ticket for an orderItem that do not belong to the user", 400)
                }
            }

            
            // validate booking is under the PBs SL
            if(data.bookingId) {
                const booking = await prisma.booking.findUnique({
                    where: {bookingId: Number(data.bookingId)},
                    include: {
                        serviceListing: true
                    }
                })
                if(booking.serviceListing.petBusinessId != petBusinessId) {
                    throw new CustomError("Unable to create support ticket for a booking that do not belong to the user", 400)
                }
            }


            // validate if Payout is for the PB
            if(data.payoutInvoiceId) {
                const payout = await prisma.payoutInvoice.findUnique({
                    where: {invoiceId: Number(data.payoutInvoiceId)}
                })
                if(payout.userId != petBusinessId) {
                    throw new CustomError("Unable to create support ticket for a payout that do not belong to the user", 400)
                }
            }

            // validate if refund requests is under the PB
            if(data.refundRequestId) {
                const refundRequest = await prisma.refundRequest.findUnique({
                    where: {refundRequestId: Number(data.refundRequestId)}
                })
                if(refundRequest.petBusinessId != petBusinessId) {
                    throw new CustomError("Unable to create support ticket for a refund request that do not belong to the user", 400)
                }
            }

            const supportTicket = await prisma.supportTicket.create({
                data: {
                    reason: data.reason,
                    attachmentKeys: data.attachmentKeys,
                    attachmentURLs: data.attachmentURLs,
                    supportCategory: data.supportCategory,
                    priority: data.priority,
                    petBusiness: {
                        connect: {
                            userId: petBusiness.userId
                        }
                    },
                    // Connect serviceListingId if it exists
                    ...(data.serviceListingId && {
                        serviceListing: {
                            connect: { serviceListingId: parseInt(data.serviceListingId, 10) },
                        },
                    }),
                    // Connect orderItemId if it exists
                    ...(data.orderItemId && {
                        orderItem: {
                            connect: { orderItemId: parseInt(data.orderItemId, 10) },
                        },
                    }),
                    // Connect bookingId if it exists
                    ...(data.bookingId && {
                        booking: {
                            connect: { bookingId: parseInt(data.bookingId, 10) },
                        },
                    }),
                    // Connect payoutInvoiceId if it exists
                    ...(data.payoutInvoiceId && {
                        payoutInvoice: {
                            connect: { invoiceId: parseInt(data.payoutInvoiceId, 10) },
                        },
                    }),
                    // Connect refundRequestId if it exists
                    ...(data.refundRequestId && {
                        refundRequest: {
                            connect: { refundRequestId: parseInt(data.refundRequestId, 10) },
                        },
                    }),
                },
                include: {
                    petBusiness: true,
                }
            })
            return supportTicket
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new SupportTicketError(error);
        }
    }

    async getSupportTicketById(supportTicketId) {
        try {
            const supportTicket = await prisma.supportTicket.findUnique({
                where: { supportTicketId: supportTicketId },
                include: {
                    petOwner: {
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
                    },
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
                    },
                    comments: true,
                    // Include related entities only if their IDs exist
                    serviceListing: true,
                    orderItem: {
                        include: {
                            invoice: {
                                include: {
                                    PetOwner: {
                                        select: {
                                            firstName: true,
                                            lastName: true,
                                            contactNumber: true,
                                            user: {
                                                select: {
                                                    email: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    booking: {
                        include: {
                            OrderItem: {
                                include: {
                                    invoice: {
                                        include: {
                                            PetOwner: {
                                                select: {
                                                    firstName: true,
                                                    lastName: true,
                                                    contactNumber: true,
                                                    user: {
                                                        select: {
                                                            email: true
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    payoutInvoice: true,
                    refundRequest: {
                        include: {
                            petOwner: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    contactNumber: true,
                                    user: {
                                        select: {
                                            email: true
                                        }
                                    }
                                }
                            },
                            orderItem: true
                        }
                    },
                },
            });
            return supportTicket
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new SupportTicketError(error);
        }
    }


    async getSupportTicketByUserId(userId) {
        try {
            const user = await baseUserServiceInstance.getUserById(userId)
            const supportTickets = await prisma.supportTicket.findMany({
                where: {
                    OR: [
                        { petBusinessId: user.userId },
                        { petOwnerId: user.userId }
                    ]
                },
                include: {
                    petOwner: true,
                    petBusiness: true,
                    comments: true
                }
            })
            return supportTickets
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new SupportTicketError(error);
        }
    }

    async getAllSupportTickets() {
        try {
            const supportTickets = await prisma.supportTicket.findMany({
                include: {
                    petOwner: true,
                    petBusiness: true,
                    comments: true
                }
            })
            return supportTickets
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new SupportTicketError(error);
        }
    }



    async addComment(supportTicketId, data) {
        try {
            const supportTicket = await this.getSupportTicketById(supportTicketId)
            const user = await baseUserServiceInstance.getUserById(Number(data.userId))

            const newComment = await prisma.$transaction(async (prismaClient) => {
                const createdComment = await prismaClient.comment.create({
                    data: {
                        comment: data.comment,
                        attachmentKeys: data.attachmentKeys,
                        attachmentURLs: data.attachmentURLs,
                        supportTicketId: supportTicket.supportTicketId,
                        userId: Number(user.userId)
                    }
                });

                let currAttachmentKeys = [...supportTicket.attachmentKeys, ...data.attachmentKeys];
                let currAttachmentURLs = [...supportTicket.attachmentURLs, ...data.attachmentURLs];

                if (user.accountType == "INTERNAL_USER" && supportTicket.status == "PENDING") {
                    await prismaClient.supportTicket.update({
                        where: { supportTicketId: supportTicketId },
                        data: {
                            status: "IN_PROGRESS"
                        }
                    })
                }

                await prismaClient.supportTicket.update({
                    where: { supportTicketId: supportTicketId },
                    data: {
                        attachmentKeys: currAttachmentKeys,
                        attachmentURLs: currAttachmentURLs,
                    }
                })

                return createdComment
            })

            return newComment
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new SupportTicketError(error);

        }
    }

    async updateSupportTicketStatus(supportTicketId, status) {
        try {
            const supportTicket = await this.getSupportTicketById(supportTicketId);

            if (status == "PENDING" && supportTicket.status != "CLOSED_UNRESOLVED") {
                throw new CustomError("Only able to reopen tickets that are closed and unresolved", 400)
            }

            const updateSupportTicket = await prisma.supportTicket.update({
                where: { supportTicketId: supportTicketId },
                data: {
                    status: status
                }
            })
            return updateSupportTicket;

        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new SupportTicketError(error);
        }
    }


}

module.exports = new SupportService();