const userGroupService = require('../services/rbac/userGroupService');
const rbacService = require('../services/rbac/rbacService');
const permissionService = require('../services/rbac/permissionService');

const validations = require('../validations');

// CREATE, RETRIEVE, UPDATE, DELETE
exports.createUserGroup = async (req, res, next) => {
    try {
        const userGroupPayload = req.body;

        if (!validations.isValidUserGroupPayload(userGroupPayload)) {
            return res.status(400).json({ message: 'Invalid payload. Both name and description must be valid.' });
        }
        const userGroupData = await userGroupService.createUserGroup(userGroupPayload);
        res.status(201).json(userGroupData);
    } catch (error) {
        next(error);
    }
};

exports.getAllUserGroups = async (req, res, next) => {
    try {
        const userGroups = await userGroupService.getAllUserGroups();
        res.status(200).json(userGroups);
    } catch (error) {
        next(error);
    }
};

exports.getUserGroupById = async (req, res, next) => {
    try {
        const userGroupId = req.params.id;
        if (!await validations.isValidNumericID(userGroupId)) {
            return res.status(400).json({ message: 'Invalid ID Format' });
        }

        const userGroup = await userGroupService.getUserGroupById(Number(userGroupId))
        res.status(200).json(userGroup)
    } catch (error) {
        next(error)
    }
}

exports.updateUserGroup = async (req, res, next) => {
    try {
        const userGroupId = req.params.id;
        if (!await validations.isValidNumericID(userGroupId)) {
            return res.status(400).json({ message: 'Invalid ID Format' });
        }

        const updateData = req.body;
        if (!validations.isValidUpdateUserGroupPayload(updateData)) {
            return res.status(400).json({ message: 'Invalid payload. Provide a valid name or description.' });
        }

        const updatedDate = await userGroupService.updateUserGroup(Number(userGroupId), updateData);
        res.status(200).json(updatedDate);
    } catch (error) {
        next(error);
    }
};


exports.deleteUserGroup = async (req, res, next) => {
    try {
        const userGroupId = req.params.id;
        if (!await validations.isValidNumericID(userGroupId)) {
            return res.status(400).json({ message: 'Invalid ID Format' });
        }

        await userGroupService.deleteUserGroup(Number(userGroupId));
        res.status(200).json({ message: 'User group deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Permission-related methods:
exports.getAllPermissions = async (req, res, next) => {
    try {
        const permissions = await permissionService.getAllPermissions();
        res.status(200).json(permissions);
    } catch (error) {
        next(error);
    }
};

exports.getPermissionById = async (req, res, next) => {
    try {
        const permissionId = req.params.id;
        if (!await validations.isValidNumericID(permissionId)) {
            return res.status(400).json({ message: 'Invalid ID Format' });
        }

        const permission = await permissionService.getPermissionById(Number(permissionId));
        res.status(200).json(permission);
    } catch (error) {
        next(error);
    }
};


exports.attachPermissionToUserGroup = async (req, res, next) => {
    try {
        const userGroupId = req.params.id;
        const { permissionIds } = req.body; // This should be an array of permissionIds

        if (!await validations.isValidNumericID(userGroupId)) {
            return res.status(400).json({ message: 'Invalid User Group ID Format' });
        }

        if (!Array.isArray(permissionIds) || ! await permissionIds.every(validations.isValidNumericID)) {
            return res.status(400).json({ message: 'Invalid Permission IDs Format' });
        }

        const permissions = await rbacService.attachPermissionToUserGroup(Number(userGroupId), permissionIds);
        res.status(200).json(permissions);
    } catch (error) {
        next(error);
    }
};

exports.detachPermissionFromUserGroup = async (req, res, next) => {
    try {
        const userGroupId = req.params.id;
        const { permissionIds } = req.body; // This should be an array of permissionIds

        if (!await validations.isValidNumericID(userGroupId)) {
            return res.status(400).json({ message: 'Invalid User Group ID Format' });
        }

        if (!Array.isArray(permissionIds) || ! await permissionIds.every(validations.isValidNumericID)) {
            return res.status(400).json({ message: 'Invalid Permission IDs Format' });
        }

        const permissions = await rbacService.detachPermissionFromUserGroup(Number(userGroupId), permissionIds);
        res.status(200).json(permissions);
    } catch (error) {
        next(error);
    }
};


exports.getUserGroupPermissions = async (req, res, next) => {
    try {
        const userGroupId = req.params.id;
        if (!await validations.isValidNumericID(userGroupId)) {
            return res.status(400).json({ message: 'Invalid ID Format' });
        }

        const permissions = await rbacService.getUserGroupPermissions(Number(userGroupId));
        res.status(200).json(permissions);
    } catch (error) {
        next(error);
    }
};

// Add a User to a User Group
exports.addUserToUserGroup = async (req, res, next) => {
    try {
        const { id, userId } = req.params;

        if (!await validations.isValidNumericID(id) || !await validations.isValidNumericID(userId)) {
            return res.status(400).json({ message: 'Invalid ID Format' });
        }

        await rbacService.addUserToUserGroup(Number(userId), Number(id));

        res.status(200).json({ message: 'User added to user group successfully' });
    } catch (error) {
        next(error);
    }
};

// Remove a User from a User Group
exports.removeUserFromUserGroup = async (req, res, next) => {
    try {
        const { id, userId } = req.params;

        if (!await validations.isValidNumericID(id) || !await validations.isValidNumericID(userId)) {
            return res.status(400).json({ message: 'Invalid ID Format' });
        }

        await rbacService.removeUserFromUserGroup(Number(userId), Number(id));

        res.status(200).json({ message: 'User removed from user group successfully' });
    } catch (error) {
        next(error);
    }
};

// Get All Permissions for a User
exports.getUserPermissions = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!await validations.isValidNumericID(userId)) {
            return res.status(400).json({ message: 'Invalid ID Format' });
        }

        const permissions = await rbacService.getUserPermissions(Number(userId));

        res.status(200).json(permissions);
    } catch (error) {
        next(error);
    }
};

