const { BaseUserService } = require('./baseUserService');
const prisma = require('../../../../prisma/prisma');
const { AccountType, AccountStatus } = require('@prisma/client');
const UserError = require('../../errors/userError');
const CustomError = require('../../errors/customError');
const validations = require('../../validations')

// Shared selection fields
const petBusinessSelectFields = {
    companyName: true,
    uen: true,
    businessType: true,
    businessDescription: true,
    contactNumber: true,
    websiteURL: true,
    userId: true,
    user: {
        select: {
            userId: true,
            email: true,
            accountType: true,
            accountStatus: true,
            dateCreated: true,
            lastUpdated: true,
        },
    },
};

class PetBusinessService extends BaseUserService {
    constructor() {
        super();
    }

    async createUser(data) {
        try {
            const hashedPassword = await this.hashPassword(data.password);

            if (!await validations.isValidUEN(data.uen)) {
                throw new CustomError('Invalid UEN Format', 400)
            }

            const user = await prisma.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    accountType: AccountType.PET_BUSINESS,
                    accountStatus: AccountStatus.INACTIVE,
                    petBusiness: {
                        create: {
                            companyName: data.companyName,
                            uen: data.uen,
                            businessType: data.businessType,
                            businessDescription: data.businessDescription,
                            contactNumber: data.contactNumber,
                            websiteURL: data.websiteURL,
                        },
                    },
                },
            });

            return this.removePassword(user);
        } catch (error) {
            console.error("Error during user creation:", error);
            throw new UserError(error);
        }
    }

    async getAllUsers() {
        try {
            return await prisma.petBusiness.findMany({
                select: petBusinessSelectFields,
            });
        } catch (error) {
            console.error("Error fetching all users:", error);
            throw new UserError(error);
        }
    }


    async getUserById(userId) {
        try {
            const user = await prisma.petBusiness.findUnique({
                where: { userId },
                select: petBusinessSelectFields,
            });

            if (!user) throw new CustomError('User not found', 404);
            return user;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            console.error("Error fetching user by ID:", error);
            throw new UserError(error);
        }
    }

    async updateUser(userId, data) {
        try {

            const updatedUser = await prisma.$transaction(async (prismaClient) => {
                if (data.email) {
                    await prismaClient.user.update({
                        where: { userId },
                        data: {
                            email: data.email,
                            lastUpdated: new Date(),
                        }
                    })
                }

                const user = await prismaClient.petBusiness.update({
                    where: { userId },
                    data: {
                        companyName: data.companyName,
                        uen: data.uen,
                        businessType: data.businessType,
                        businessDescription: data.businessDescription,
                        contactNumber: data.contactNumber,
                        websiteURL: data.websiteURL,
                    },
                    include: {
                        user: true
                    }
                });
                return user
            })

            return this.removePassword(updatedUser);
        } catch (error) {
            console.error("Error during user update:", error);
            throw new UserError(error);
        }
    }

    async deleteUser(userId) {
        try {
            return await prisma.petBusiness.delete({
                where: { userId },
            });
        } catch (error) {
            console.error("Error during user deletion:", error);
            throw new UserError(error);
        }
    }

}

module.exports = new PetBusinessService();
