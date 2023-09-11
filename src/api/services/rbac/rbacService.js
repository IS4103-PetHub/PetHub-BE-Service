// src/api/domain/rbacService.js

const prisma = require('../../../../prisma/prisma');
const internalUserService = require('../user/internalUserService')
const CustomError = require('../../errors/customError');
const RbacError = require('../../errors/rbacError');
const UserError = require('../../errors/userError');

class RbacService {

    constructor() { }

    async attachPermissionToUserGroup(groupId, permissionIds) {
        const failedPermissionIds = [];

        try {
            const existingPermissions = await this.getUserGroupPermissions(groupId);
            const existingPermissionIds = existingPermissions.map((entry) => entry.permissionId);

            await prisma.$transaction(async (prismaClient) => {
                for (const permissionId of permissionIds) {
                    if (!existingPermissionIds.includes(permissionId)) {
                        try {
                            await prismaClient.userGroupPermission.create({
                                data: {
                                    groupId: groupId,
                                    permissionId: permissionId,
                                },
                            });
                        } catch (error) {
                            failedPermissionIds.push(permissionId);
                        }
                    }
                }
            });

            if (failedPermissionIds.length > 0) {
                throw new CustomError(`Failed to attach permissions for permission IDs: ${failedPermissionIds.join(', ')}.`, 400);
            }

            return await this.getUserGroupPermissions(groupId);
        } catch (error) {
            if (error instanceof CustomError) throw error;
            console.error("Error in attachPermissionToUserGroup:", error);
            throw new CustomError("Failed to attach permissions due to an unexpected error", 500);
        }
    }


    async detachPermissionFromUserGroup(groupId, permissionIds) {
        const failedPermissionIds = [];

        try {
            await prisma.$transaction(async (prismaClient) => {
                for (const permissionId of permissionIds) {
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
                        failedPermissionIds.push(permissionId);
                    }
                }

                if (failedPermissionIds.length > 0) {
                    throw new CustomError(`Failed to attach permissions for permission IDs: ${failedPermissionIds.join(', ')}.`, 400);
                }
            });

            return await this.getUserGroupPermissions(groupId);
        } catch (error) {
            if (error instanceof CustomError) throw error;
            console.error("Error in detachPermissionFromUserGroup:", error);
            throw new CustomError("Failed to detach permissions due to an unexpected error", 500);
        }
    }


    async getUserGroupPermissions(groupId) {
        try {
            const userGroup = await prisma.userGroup.findUnique({
                where: { groupId: groupId },
                include: {
                    userGroupPermissions: {
                        include: { permission: true }
                    }
                }
            });

            if (!userGroup) {
                throw new CustomError("User Group not found", 404);
            }

            const permissionsSet = new Set();

            userGroup.userGroupPermissions.forEach(permission => {
                permissionsSet.add(permission.permission);
            });

            return [...permissionsSet];

        } catch (error) {
            if (error instanceof CustomError) throw error;
            console.error("Error fetching permissions for user group:", error);
            throw new CustomError("Error fetching permissions for user group", 500);
        }
    }

    async addUserToUserGroup(userId, groupId) {
        try {
            // Ensure that the user is an internal user
            // await internalUserService.getUserById(userId)
            await prisma.userGroupMembership.create({
                data: {
                    userId: userId,
                    groupId: groupId
                }
            });
        } catch (error) {
            // if (error instanceof CustomError || error instanceof UserError) throw error;
            console.error("Error adding user to user group:", error);
            throw new RbacError(error);
        }
    }

    async removeUserFromUserGroup(userId, groupId) {
        try {
            await prisma.userGroupMembership.delete({
                where: {
                    userId_groupId: {
                        userId: userId,
                        groupId: groupId
                    }
                }
            });
        } catch (error) {
            console.error("Error removing user from user group:", error);
            throw new RbacError(error);
        }
    }

    async getUserPermissions(userId) {
        try {
            // Fetch permissions based on user groups
            const userGroupsPermissions = await prisma.userGroupMembership.findMany({
                where: {
                    userId: userId
                },
                include: {
                    userGroup: {
                        include: {
                            userGroupPermissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            });

            const permissionsSet = new Set();

            userGroupsPermissions.forEach(ugp => {
                ugp.userGroup.userGroupPermissions.forEach(permission => {
                    permissionsSet.add(permission.permission);
                });
            });

            return [...permissionsSet];
        } catch (error) {
            console.error("Error fetching user permissions:", error);
            throw new CustomError("Failed to fetch user permissions due to an unexpected error", 500);
        }
    }

}

module.exports = new RbacService();
