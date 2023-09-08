// src/api/domain/rbacService.js

const prisma = require('../../../../prisma/prisma');
const CustomError = require('../../errors/customError');
const RbacError = require('../../errors/rbacError');

class RbacService {

    constructor() { }

    async attachPermissionToUserGroup(groupId, permissionIds) {
        try {
            const transactions = [];
            const failedPermissions = [];

            permissionIds.forEach(permissionId => {
                transactions.push(prisma.userGroupPermission.create({
                    data: {
                        groupId: groupId,
                        permissionId: permissionId
                    }
                }).catch(error => {
                    if (error.code === 'P2002') {  // Unique constraint error (association already exists)
                        console.error("Error attaching individual permission to user group - Permissions already attached to specified group:", error);
                        failedPermissions.push({
                            permissionId,
                            reason: 'Permissions already attached to specified group'
                        });
                    } else if (error.code === 'P2003') {  // Foreign key constraint error (permissionId doesn't exist)
                        console.error("Error attaching individual permission to user group - Permission doesn't exist:", error);
                        failedPermissions.push({
                            permissionId,
                            reason: 'Permission doesn\'t exist'
                        });
                    } else {
                        console.error("Unknown error attaching individual permission to user group:", error);
                    }
                }));
            });

            await Promise.all(transactions);

            if (failedPermissions.length > 0) {
                throw new CustomError(`Failed to attach permissions. Details: ${JSON.stringify(failedPermissions)}`, 400);
            }

            return await this.getUserGroupPermissions(groupId);
        } catch (error) {
            if (error instanceof CustomError) throw error;
            console.error("Error in attachPermissionToUserGroup:", error);
            throw new RbacError("Failed to attach permissions due to an unexpected error", 500);
        }
    }


    async detachPermissionFromUserGroup(groupId, permissionIds) {
        try {
            const transactions = [];
            const failedPermissions = [];

            permissionIds.forEach(permissionId => {
                transactions.push(prisma.userGroupPermission.delete({
                    where: {
                        groupId_permissionId: {
                            groupId: groupId,
                            permissionId: permissionId
                        }
                    }
                }).catch(error => {
                    if (error.code === 'P2025') {  // Error code for "Record does not exist"
                        console.error("Error detaching individual permission from user group - Permission not attached to specified group:", error);
                        failedPermissions.push({
                            permissionId,
                            reason: 'Permission not attached to specified group'
                        });
                    } else if (error.code === 'P2003') {  // Foreign key constraint error (permissionId doesn't exist)
                        console.error("Error detaching individual permission from user group - Permission doesn't exist:", error);
                        failedPermissions.push({
                            permissionId,
                            reason: 'Permission doesn\'t exist'
                        });
                    } else {
                        console.error("Unknown error detaching individual permission from user group:", error);
                    }
                }));
            });

            await Promise.all(transactions);

            if (failedPermissions.length > 0) {
                throw new CustomError(`Failed to detach permissions. Details: ${JSON.stringify(failedPermissions)}`, 400);
            }

            return await this.getUserGroupPermissions(groupId);
        } catch (error) {
            if (error instanceof CustomError) throw error;
            console.error("Error in detachPermissionFromUserGroup:", error);
            throw new RbacError("Failed to detach permissions due to an unexpected error", 500);
        }
    }


    async getUserGroupPermissions(groupId) {
        try {
            const userGroup = await prisma.userGroup.findUnique({
                where: { groupId: groupId },
                include: {
                    user_group_permissions: {
                        include: {
                            permission: true
                        }
                    }
                }
            });

            if (!userGroup) {
                throw new CustomError("User Group not found", 404);
            }

            const permissionsSet = new Set();

            userGroup.user_group_permissions.forEach(permission => {
                permissionsSet.add(permission.permission);
            });

            return [...permissionsSet];

        } catch (error) {
            if (error instanceof CustomError) throw error;
            console.error("Error fetching permissions for user group:", error);
            throw new RbacError("Error fetching permissions for user group", 500);
        }
    }

    async addUserToUserGroup(userId, groupId) {
        try {
            await prisma.userGroupMembership.create({
                data: {
                    userId: userId,
                    groupId: groupId
                }
            });
        } catch (error) {
            console.error("Error adding user to user group:", error);
            throw new RbacError("Failed to add user to user group due to an unexpected error", 500);
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
            throw new RbacError("Failed to remove user from user group due to an unexpected error", 500);
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
                            user_group_permissions: {
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
                ugp.userGroup.user_group_permissions.forEach(permission => {
                    permissionsSet.add(permission.permission);
                });
            });

            return [...permissionsSet];
        } catch (error) {
            console.error("Error fetching user permissions:", error);
            throw new RbacError("Failed to fetch user permissions due to an unexpected error", 500);
        }
    }

}

module.exports = new RbacService();
