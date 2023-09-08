const InternalUserService = require('../../../src/api/services/user/internalUserService');
const { AccountStatus, AccountType } = require('@prisma/client');


const permissions = [
    // USERS
    { code: "POST_USERS", name: "Write Users", description: "Permission to modify user data", endpoint: "/users", method: "POST" },
    { code: "GET_USERS", name: "Read Users", description: "Permission to read user data", endpoint: "/users", method: "GET" },
    { code: "GET_USERS_ID", name: "Read Users by ID", description: "Permission to read user data by ID", endpoint: "/users/:id", method: "GET" },
    { code: "PATCH_USERS_ID", name: "Update Users", description: "Permission to update user data by ID", endpoint: "/users/:id", method: "PATCH" },
    { code: "DELETE_USERS_ID", name: "Delete Users", description: "Permission to delete users by ID", endpoint: "/users/:id", method: "DELETE" },

    // AUTHENTICATION
    { code: "POST_FORGET_PASSWORD", name: "Forget Password", description: "Permission to initiate the forget password process", endpoint: "/forget-password", method: "POST" },
    { code: "POST_RESET_PASSWORD_TOKEN", name: "Reset Password from Token", description: "Permission to reset password from token", endpoint: "/reset-password/:token", method: "POST" },
    { code: "POST_CHANGE_PASSWORD", name: "Change Password", description: "Permission to change password", endpoint: "/change-password", method: "POST" },
    { code: "POST_USER_LOGIN", name: "Users Login", description: "Permission for users to log in", endpoint: "/login", method: "POST" },

    // PET OWNERS
    { code: "POST_PET_OWNERS", name: "Create Pet Owners", description: "Permission to create pet owners", endpoint: "/pet-owners", method: "POST" },
    { code: "GET_PET_OWNERS", name: "Read Pet Owners", description: "Permission to read pet owners", endpoint: "/pet-owners", method: "GET" },
    { code: "GET_PET_OWNERS_ID", name: "Read Pet Owners by ID", description: "Permission to read pet owners by ID", endpoint: "/pet-owners/:id", method: "GET" },
    { code: "PATCH_PET_OWNERS_ID", name: "Update Pet Owners", description: "Permission to update pet owners by ID", endpoint: "/pet-owners/:id", method: "PATCH" },
    { code: "DELETE_PET_OWNERS_ID", name: "Delete Pet Owners", description: "Permission to delete pet owners by ID", endpoint: "/pet-owners/:id", method: "DELETE" },

    // PET BUSINESS
    { code: "POST_PET_BUSINESSES", name: "Create Pet Businesses", description: "Permission to create pet businesses", endpoint: "/pet-businesses", method: "POST" },
    { code: "GET_PET_BUSINESSES", name: "Read Pet Businesses", description: "Permission to read pet businesses", endpoint: "/pet-businesses", method: "GET" },
    { code: "GET_PET_BUSINESSES_ID", name: "Read Pet Businesses by ID", description: "Permission to read pet businesses by ID", endpoint: "/pet-businesses/:id", method: "GET" },
    { code: "PATCH_PET_BUSINESSES_ID", name: "Update Pet Businesses", description: "Permission to update pet businesses by ID", endpoint: "/pet-businesses/:id", method: "PATCH" },
    { code: "DELETE_PET_BUSINESSES_ID", name: "Delete Pet Businesses", description: "Permission to delete pet businesses by ID", endpoint: "/pet-businesses/:id", method: "DELETE" },

    // RBAC
    { code: "POST_RBAC_USER_GROUPS", name: "Create User Groups", description: "Permission to create user groups", endpoint: "/rbac/user-groups", method: "POST" },
    { code: "GET_RBAC_USER_GROUPS", name: "Read User Groups", description: "Permission to read user groups", endpoint: "/rbac/user-groups", method: "GET" },
    { code: "GET_RBAC_USER_GROUPS_ID", name: "Read User Groups by ID", description: "Permission to read user groups by ID", endpoint: "/rbac/user-groups/:id", method: "GET" },
    { code: "PATCH_RBAC_USER_GROUPS_ID", name: "Update User Groups", description: "Permission to update user groups by ID", endpoint: "/rbac/user-groups/:id", method: "PATCH" },
    { code: "DELETE_RBAC_USER_GROUPS_ID", name: "Delete User Groups", description: "Permission to delete user groups by ID", endpoint: "/rbac/user-groups/:id", method: "DELETE" },
    { code: "POST_RBAC_USER_GROUPS_ID_ATTACH_PERMISSION", name: "Attach Permission to User Group", description: "Permission to attach permissions to user groups", endpoint: "/rbac/user-groups/:id/attach-permission", method: "POST" },
    { code: "POST_RBAC_USER_GROUPS_ID_DETACH_PERMISSION", name: "Detach Permission from User Group", description: "Permission to detach permissions from user groups", endpoint: "/rbac/user-groups/:id/detach-permission", method: "POST" },
    { code: "GET_RBAC_USER_GROUPS_ID_PERMISSIONS", name: "Read User Group Permissions", description: "Permission to read permissions of user groups", endpoint: "/rbac/user-groups/:id/permissions", method: "GET" },
    { code: "POST_RBAC_USER_GROUPS_ID_ADD_USER_USERID", name: "Add User to User Group", description: "Permission to add users to user groups", endpoint: "/rbac/user-groups/:id/add-user/:userId", method: "POST" },
    { code: "POST_RBAC_USER_GROUPS_ID_REMOVE_USER_USERID", name: "Remove User from User Group", description: "Permission to remove users from user groups", endpoint: "/rbac/user-groups/:id/remove-user/:userId", method: "POST" },
    { code: "GET_USERS_USERID_PERMISSIONS", name: "Read User Permissions", description: "Permission to read user permissions", endpoint: "/users/:userId/permissions", method: "GET" },
    { code: "GET_RBAC_PERMISSIONS", name: "Read Permissions", description: "Permission to read permissions", endpoint: "/rbac/permissions", method: "GET" },
    { code: "GET_RBAC_PERMISSIONS_ID", name: "Read Permission by ID", description: "Permission to read permissions by ID", endpoint: "/rbac/permissions/:id", method: "GET" },
];

// Root Administrator User Data
const rootAdminData = {
    email: 'rootadmin@pethub.com',
    password: 'password',
    firstName: 'Root',
    lastName: 'Administrator',
    adminRole: 'ADMINISTRATOR',
};

// Root Administrator Group Data
const rootAdminGroupData = {
    name: 'Root Administrators',
    description: 'Group with all permissions',
};

async function seedRBAC(prisma) {
    // Seed permissions
    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: { code: permission.code },
            update: {},
            create: permission
        });
    }

    // Check if the Root Administrator exists
    const existingRootAdmin = await prisma.user.findUnique({ where: { email: rootAdminData.email } });
    if (existingRootAdmin) {
        // Delete the UserGroupMembership for the Root Administrator
        await prisma.userGroupMembership.deleteMany({
            where: {
                userId: existingRootAdmin.id
            }
        });

        // Now, delete the Root Administrator user
        await prisma.user.delete({ where: { email: rootAdminData.email } });
    }

    // Create Root Administrator user and associated InternalUser
    const rootAdmin = await InternalUserService.createUser(rootAdminData);
    console.log("Root Administrator created:", rootAdmin);

    // Activate Root Administrator
    const user = await prisma.user.update({
        where: { userId: rootAdmin.userId },
        data: {
            accountStatus: AccountStatus.ACTIVE,
        },
    });


    // Create or update root-administrators user group
    const rootAdminGroup = await prisma.userGroup.upsert({
        where: { name: rootAdminGroupData.name },
        create: rootAdminGroupData,
        update: { name: rootAdminGroupData.name } // This is a noop, but necessary for upsert
    });

    // Fetch all permissions
    const allPermissions = await prisma.permission.findMany();

    // Assign all permissions to root-administrators group
    for (const permission of allPermissions) {
        await prisma.userGroupPermission.upsert({
            where: {
                groupId_permissionId: {
                    groupId: rootAdminGroup.groupId,
                    permissionId: permission.permissionId
                }
            },
            create: {
                groupId: rootAdminGroup.groupId,
                permissionId: permission.permissionId
            },
            update: {} // Another noop for upsert
        });
    }

    // Add the Root Administrator to the root-administrators group
    await prisma.userGroupMembership.upsert({
        where: {
            userId_groupId: {
                userId: rootAdmin.userId,
                groupId: rootAdminGroup.groupId
            }
        },
        create: {
            userId: rootAdmin.userId,
            groupId: rootAdminGroup.groupId
        },
        update: {} // Another noop
    });

    console.log('Seeding completed!');
}

module.exports = {
    permissions,
    rootAdminData,
    rootAdminGroupData,
    seedRBAC
};