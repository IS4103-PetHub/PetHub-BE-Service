const UserGroupError = require('../../errors/userGroupError');
const CustomError = require('../../errors/customError');
const prisma = require('../../../../prisma/prisma');

class UserGroupService {

    async getUserGroupById(id) {
        try {
            const userGroup = await prisma.userGroup.findUnique({
                where: { groupId: id },
            });

            if (!userGroup) throw new CustomError('User group not found', 404);
            return userGroup;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            console.error("Error fetching user group by ID:", error);
            throw new UserGroupError(error);
        }
    }

    async deleteUserGroup(id) {
        try {
            return await prisma.userGroup.delete({
                where: { groupId: id },
            });
        } catch (error) {
            console.error("Error during user group deletion:", error);
            throw new UserGroupError(error);
        }
    }

    async updateUserGroup(id, data) {
        try {
            return await prisma.userGroup.update({
                where: { groupId: id },
                data: {
                    name: data.name,
                    description: data.description,
                },
            });
        } catch (error) {
            console.error("Error during user group update:", error);
            throw new UserGroupError(error);
        }
    }

    async createUserGroup(data) {
        try {
            const userGroup = await prisma.userGroup.create({
                data: {
                    name: data.name,
                    description: data.description,
                },
            });
            return userGroup;
        } catch (error) {
            console.error("Error during internal user group creation:", error);
            throw new UserGroupError(error);
        }
    }

    async getAllUserGroups() {
        try {
            return await prisma.userGroup.findMany();
        } catch (error) {
            console.error("Error fetching all internal user groups:", error);
            throw new UserGroupError(error);
        }
    }

}

module.exports = new UserGroupService();
