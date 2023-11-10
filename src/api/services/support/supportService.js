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
            const supportTicket = await prisma.supportTicket.create({
                data: {
                    reason: data.reason,
                    attachmentKeys: data.attachmentKeys,
                    attachmentURLs: data.attachmentURLs,
                    supportCategory: data.supportCategory,
                    priority: data.priority,
                    petOwnerId: petOwner.userId
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
            const supportTicket = await prisma.supportTicket.create({
                data: {
                    reason: data.reason,
                    attachmentKeys: data.attachmentKeys,
                    attachmentURLs: data.attachmentURLs,
                    supportCategory: data.supportCategory,
                    priority: data.priority,
                    petBusinessId: petBusiness.userId
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
                            }
                        }
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
                            }
                        }
                    },
                    comments: true
                }
            })
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

                if(user.accountType == "INTERNAL_USER" && supportTicket.status == "PENDING") {
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

            if(status == "PENDING" && supportTicket.status != "CLOSED_UNRESOLVED") {
                throw new CustomError("Only able to reopen tickets that are closed and unresolved", 400)
            }

            const updateSupportTicket = await prisma.supportTicket.update({
                where: {supportTicketId: supportTicketId},
                data: {
                    status: status
                }
            })
            return updateSupportTicket;

        } catch(error) {
            if (error instanceof CustomError) throw error;
            throw new SupportTicketError(error);
        }
    }


}

module.exports = new SupportService();