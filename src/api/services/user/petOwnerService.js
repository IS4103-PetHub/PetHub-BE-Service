const BaseUserService = require('./baseUserService');
const prisma = require('../../../../prisma/prisma');
const { AccountType, AccountStatus } = require('@prisma/client');
const UserError = require('../../errors/userError');
const CustomError = require('../../errors/customError');

// Shared selection fields
const petOwnerSelectFields = {
    firstName: true,
    lastName: true,
    contactNumber: true,
    dateOfBirth: true,
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

class PetOwnerService extends BaseUserService {
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

            return this.removePassword(user);
        } catch (error) {
            console.error("Error during user creation:", error);
            throw new UserError(error);
        }
    }

    async getAllUsers() {
        try {
            return await prisma.petOwner.findMany({
                select: petOwnerSelectFields,
            });
        } catch (error) {
            console.error("Error fetching all users:", error);
            throw new UserError(error);
        }
    }

    async getUserById(userId) {
        try {
            const user = await prisma.petOwner.findUnique({
                where: { userId },
                select: petOwnerSelectFields,
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
            const user = await prisma.petOwner.update({
                where: { userId },
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    contactNumber: data.contactNumber,
                    dateOfBirth: data.dateOfBirth,
                },
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
            return await prisma.petOwner.delete({
                where: { userId },
            });
        } catch (error) {
            console.error("Error during user deletion:", error);
            throw new UserError(error);
        }
    }
}

module.exports = new PetOwnerService();
