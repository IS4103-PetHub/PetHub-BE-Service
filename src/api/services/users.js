const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = {

    getAllUsers: async () => {
        try {
            return await prisma.user.findMany();
        } catch (error) {
            throw error
        }
    },
    getAllApplicationAdmins: async () => {
        try {
            return await prisma.applicationAdmin.findMany({
                include: {
                    user: true,
                },
            });
        } catch (error) {
            throw error
        }
    },
    getAllPetOwners: async () => {
        try {
            return await prisma.petOwner.findMany({
                include: {
                    user: true,
                },
            });
        } catch (error) {
            throw error
        }
    },
    getAllPetBusinesses: async () => {
        try {
            return await prisma.petBusiness.findMany({
                include: {
                    user: true,
                },
            });
        } catch (error) {
            throw error
        }
    },
    getUserByEmail: async (email) => {
        try {
            return await prisma.user.findUnique({
                where: {
                    email,
                },
                include: {
                    applicationAdmin: true,
                    petOwner: true,
                    petBusiness: true,
                },
            })
        } catch (error) {
            throw error
        }
    },

    createApplicationAdmin: async (applicationAdminPayload) => {
        try {
            return await prisma.applicationAdmin.create({
                data: applicationAdminPayload,
                include: {
                    user: true,
                }
            })
        } catch (error) {
            throw error
        }
    },
    createPetOwner: async (petOwnerPayload) => {
        try {
            return await prisma.petOwner.create({
                data: petOwnerPayload,
                include: {
                    user: true,
                },
            })
        }  catch (error) {
            throw error
        }
    },
    createPetBusiness: async (petBusinessPayload) => {
        try {
            return await prisma.petBusiness.create({
                data: petBusinessPayload,
                include: {
                    user: true,
                }
            })
        } catch (error) {
            throw error
        }
    }
}