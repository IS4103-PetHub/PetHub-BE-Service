const UserGroupError = require('../../errors/userGroupError');
const CustomError = require('../../errors/customError');
const prisma = require('../../../../prisma/prisma');
const rbacService = require('./rbacService');

class UserGroupService {

    async getUserGroupById(id) {
        try {
            const userGroup = await prisma.userGroup.findUnique({
                where: { groupId: id },
                include: {
                    userGroupPermissions: {
                        include: { permission: true }
                    },
                    userGroupMemberships: {
                        include: { 
                            user: {
                                include: { 
                                    internalUser: {
                                        select: {
                                            firstName: true,
                                            lastName: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                }
            });

            if (!userGroup) throw new CustomError('User group not found', 404);

            // Sanitize user data
            if (userGroup.userGroupMemberships) {
                userGroup.userGroupMemberships.forEach(membership => {
                    if (membership.user) {
                        delete membership.user.password;
                    }
                });
            }

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
    async updateUserGroup(groupId, data) {
        try {
            const existingPermissions = await rbacService.getUserGroupPermissions(groupId);
            const existingPermissionIdsSet = new Set(existingPermissions.map(entry => entry.permissionId));
            const newPermissionIdsSet = (data.permissionIds) ? new Set(data.permissionIds) : [];
            // Dont remove permission if data.permissionids is empty
            const permissionIdsToRemove = (data.permissionIds) ? [...existingPermissionIdsSet].filter(permissionId => !newPermissionIdsSet.has(permissionId)) : [];

            const updatedUserGroup = await prisma.$transaction(async (prismaClient) => {
                // Update User Group Details
                const updatedGroup = await prismaClient.userGroup.update({
                    where: { groupId: groupId },
                    data: {
                        name: data.name,
                        description: data.description,
                    },
                });

                // Only run change when permissionids is given
                if (data.permissionIds) {
                    // Delete existing permissionIDs that are not part of the payload
                    for (const permissionId of permissionIdsToRemove) {
                        try {
                            await prismaClient.userGroupPermission.delete({
                                where: {
                                    groupId_permissionId: {
                                        groupId: groupId,
                                        permissionId: permissionId
                                    }
                                }
                            });
                        } catch (error) {
                            throw new CustomError(`Failed to detach permissions for permission ID: ${permissionId}.`, 400);
                        }
                    }
    
                    // Add additional permissionIDs that are not part of the existing permissions
                    for (const permissionId of data.permissionIds) {
                        if (!existingPermissionIdsSet.has(permissionId)) {
                            try {
                                await prismaClient.userGroupPermission.create({
                                    data: {
                                        groupId: groupId,
                                        permissionId: permissionId,
                                    },
                                });
                            } catch (error) {
                                throw new CustomError(`Failed to attach new permissions for permission ID: ${permissionId}.`, 400);
                            }
                        }
                    }
                }

                return updatedGroup;
            });

            // Fetch and return the updated user group along with its permissions
            return await this.getUserGroupById(updatedUserGroup.groupId);
        } catch (error) {
            if (error instanceof CustomError) throw error
            console.error("Error during user group update:", error);
            throw new UserGroupError(error);
        }
    }


    async createUserGroup(data) {

        try {
            const createdUserGroup = await prisma.$transaction(async (prismaClient) => {
                // Create new user group
                const userGroup = await prismaClient.userGroup.create({
                    data: {
                        name: data.name,
                        description: data.description,
                    },
                });

                for (const permissionId of data.permissionIds) {
                    try {
                        await prismaClient.userGroupPermission.create({
                            data: {
                                groupId: userGroup.groupId,
                                permissionId: permissionId,
                            },
                        });
                    } catch (error) {
                        throw new CustomError(`Failed to attach permissions for permission ID: ${permissionId}.`, 400);
                    }
                }

                return userGroup;
            });

            // Fetch and return the created user group along with its permissions
            return await this.getUserGroupById(createdUserGroup.groupId);
        } catch (error) {
            if (error instanceof CustomError) throw error
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
