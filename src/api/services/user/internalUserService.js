const { BaseUserService } = require('./baseUserService');
const prisma = require('../../../../prisma/prisma');
const { AccountType, AccountStatus } = require('@prisma/client');
const UserError = require('../../errors/userError')
const CustomError = require('../../errors/customError')
const usersHelper = require('../../helpers/usersHelper');
const emailTemplate = require(`../../resource/emailTemplate`);
const emailService = require('../emailService');

// Shared selection fields
const internalUserSelectFields = {
    firstName: true,
    lastName: true,
    adminRole: true,
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

class InternalUserService extends BaseUserService {
    constructor() {
        super();
    }

    async createUser(data) {
        try {
            const password = usersHelper.generateUniqueToken()
            const hashedPassword = await this.hashPassword(password);
            const user = await prisma.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    accountType: AccountType.INTERNAL_USER,
                    accountStatus: AccountStatus.ACTIVE,
                    internalUser: {
                        create: {
                            firstName: data.firstName,
                            lastName: data.lastName,
                            adminRole: data.adminRole,
                        },
                    },
                },
            });

            const body = emailTemplate.CreateNewInternalUser(data.firstName, data.email, password)
            await emailService.sendEmail(data.email, "IMPORTANT: Your PetHub Account Has Been Created", body)

            return this.removePassword(user);
        } catch (error) {
            console.error("Error during user creation:", error);
            throw new UserError(error);
        }
    }

    async getAllUsers() {
        try {
            return await prisma.internalUser.findMany({
                select: internalUserSelectFields,
            });
        } catch (error) {
            console.error("Error fetching all users:", error);
            throw new UserError(error);
        }
    }

    async getUserById(userId) {
        try {
            const user = await prisma.internalUser.findUnique({
                where: { userId },
                select: internalUserSelectFields,
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

                const user = await prismaClient.internalUser.update({
                    where: { userId },
                    data: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        adminRole: data.adminRole,
                    },
                    include: {
                        user: true
                    }
                });

                return user
            })

            delete updatedUser.user.password;
            return this.removePassword(updatedUser);
        } catch (error) {
            console.error("Error during user update:", error);
            throw new UserError(error);
        }
    }

    async deleteUser(userId) {
        try {
            return await prisma.user.delete({
                where: { userId },
            });
        } catch (error) {
            console.error("Error during user deletion:", error);
            throw new UserError(error);
        }
    }
}

module.exports = new InternalUserService();
