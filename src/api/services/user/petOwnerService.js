const BaseUserService = require('./baseUserService');
const prisma = require('../../../../prisma/prisma');
const bcrypt = require('bcryptjs');
const { AccountType, AccountStatus } = require('@prisma/client');

class PetOwnerService extends BaseUserService {
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
                    accountType: AccountType.PET_OWNER,
                    accountStatus: AccountStatus.INACTIVE,
                    petOwner: {
                        create: {
                            firstName: data.firstName,
                            lastName: data.lastName,
                            contactNumber: data.contactNumber,
                            dateOfBirth: data.dateOfBirth,
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
            const user = await prisma.petOwner.update({
                where: { userId },
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    contactNumber: data.contactNumber,
                    dateOfBirth: data.dateOfBirth,
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
            const user = await prisma.petOwner.delete({
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
            return await prisma.petOwner.findMany();
        } catch (error) {
            console.error("Error fetching all users:", error);
            throw error;
        }
    }

    async getUserById(userId) {
        try {
            return await prisma.petOwner.findUnique({
                where: { userId },
            });
        } catch (error) {
            console.error("Error fetching user by ID:", error);
            throw error;
        }
    }
}

module.exports = new PetOwnerService();
