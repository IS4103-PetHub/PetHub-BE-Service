const InternalUserService = require('../../../src/api/services/user/internalUserService');
const { AccountStatus, AccountType } = require('@prisma/client');


const permissions = [
    // USERS
    { code: "WRITE_USERS", name: "Write Users", description: "Permission to write user data" },
    { code: "READ_USERS", name: "Read Users", description: "Permission to read user data" },

    // PET OWNERS
    { code: "WRITE_PET_OWNERS", name: "Write Pet Owners", description: "Permission to write pet owners" },
    { code: "READ_OWNERS", name: "Read Pet Owners", description: "Permission to read pet owners" },

    // PET BUSINESS
    { code: "WRITE_PET_BUSINESSES", name: "Write Pet Businesses", description: "Permission to write pet businesses" },
    { code: "READ_PET_BUSINESSES", name: "Read Pet Businesses", description: "Permission to read pet businesses" },

    // RBAC
    { code: "WRITE_RBAC", name: "Write RBAC", description: "Permission to write Role-Based Access Controls" },
    { code: "READ_RBAC", name: "Read RBAC", description: "Permission to read Role-Based Access Controls" },

    // Tags
    { code: "WRITE_TAGS", name: "Write Tags", description: "Permission to write Tags" },
    { code: "READ_TAGS", name: "Read Tags", description: "Permission to read Tags" },

    // Pet Business Applications
    { code: "WRITE_PET_BUSINESS_APPLICATION", name: "Write Pet Business Application", description: "Permission to write Pet Business Application" },
    { code: "READ_PET_BUSINESS_APPLICATION", name: "Read Pet Business Application", description: "Permission to read Pet Business Application" },

];

// Root Administrator User Data
const rootAdminData = {
    email: 'rootadmin@pethub.com',
    password: 'password123',
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