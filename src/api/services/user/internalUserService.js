const BaseUserService = require('./baseUserService');
const prisma = require('../../../../prisma/prisma');
const bcrypt = require('bcryptjs');
const { AccountType, AccountStatus } = require('@prisma/client');

class InternalUserService extends BaseUserService {
    constructor() {
        super();
    }

    async createUser(data) {
        try {
            const hashedPassword = await bcrypt.hash(data.password, 10);
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
            return user;
        } catch (error) {
            console.error("Error during user creation:", error);
            throw error;
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
            });
            return user;
        } catch (error) {
            console.error("Error during user update:", error);
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            const user = await prisma.internalUser.delete({
                where: { userId },
            });
            return user;
        } catch (error) {
            console.error("Error during user deletion:", error);
            throw error;
        }
    }

    async getAllUsers() {
        try {
            return await prisma.internalUser.findMany();
        } catch (error) {
            console.error("Error fetching all users:", error);
            throw error;
        }
    }

    async getUserById(userId) {
        try {
            return await prisma.internalUser.findUnique({
                where: { userId },
            });
        } catch (error) {
            console.error("Error fetching user by ID:", error);
            throw error;
        }
    }
}

module.exports = new InternalUserService();
