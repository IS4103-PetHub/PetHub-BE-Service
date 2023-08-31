const BaseUserService = require('./baseUserService');
const prisma = require('../../../../prisma/prisma');
const bcrypt = require('bcryptjs');
const { AccountType, AccountStatus } = require('@prisma/client');

class PetBusinessService extends BaseUserService {
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
            return user;
        } catch (error) {
            console.error("Error during user creation:", error);
            throw error;
        }
    }

    async updateUser(userId, data) {
        try {
            const user = await prisma.petBusiness.update({
                where: { userId },
                data: {
                    companyName: data.companyName,
                    uen: data.uen,
                    businessType: data.businessType,
                    businessDescription: data.businessDescription,
                    contactNumber: data.contactNumber,
                    websiteURL: data.websiteURL,
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
            const user = await prisma.petBusiness.delete({
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
            return await prisma.petBusiness.findMany();
        } catch (error) {
            console.error("Error fetching all users:", error);
            throw error;
        }
    }

    async getUserById(userId) {
        try {
            return await prisma.petBusiness.findUnique({
                where: { userId },
            });
        } catch (error) {
            console.error("Error fetching user by ID:", error);
            throw error;
        }
    }
}

module.exports = new PetBusinessService();
