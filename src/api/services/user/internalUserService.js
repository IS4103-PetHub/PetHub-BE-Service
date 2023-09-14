const { BaseUserService } = require('./baseUserService');
const prisma = require('../../../../prisma/prisma');
const { AccountType, AccountStatus } = require('@prisma/client');
const UserError = require('../../errors/userError')
const CustomError = require('../../errors/customError')

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
            const hashedPassword = await this.hashPassword(data.password);
            const user = await prisma.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    accountType: AccountType.INTERNAL_USER,
                    accountStatus: AccountStatus.INACTIVE,
                    internalUser: {
                        create: {
                            firstName: data.firstName,
                            lastName: data.lastName,
                            adminRole: data.adminRole,
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
            const user = await prisma.internalUser.update({
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

            if (!user) throw new CustomError('User not found', 404);

            return this.removePassword(user);
        } catch (error) {
            console.error("Error during user update:", error);
            throw new UserError(error);
        }
    }

    async deleteUser(userId) {
        try {
            return await prisma.internalUser.delete({
                where: { userId },
            });
        } catch (error) {
            console.error("Error during user deletion:", error);
            throw new UserError(error);
        }
    }
}

module.exports = new InternalUserService();
