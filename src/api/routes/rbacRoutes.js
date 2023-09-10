const express = require('express');
const router = express.Router();
const rbacController = require('../controllers/rbacController');

router.get('/', async (req, res, next) => {
    res.send({ message: 'Ok RBAC api is working 🚀' });
});

const userGroupBasePath = '/user-groups';
const permissionBasePath = '/permissions';
const userBasePath = '/users';

function registerRBACRoutes(controller) {
    // UserGroup routes
    router.post(`${userGroupBasePath}`, controller.createUserGroup);
    router.get(`${userGroupBasePath}`, controller.getAllUserGroups);
    router.get(`${userGroupBasePath}/:id`, controller.getUserGroupById);
    router.patch(`${userGroupBasePath}/:id`, controller.updateUserGroup);
    router.delete(`${userGroupBasePath}/:id`, controller.deleteUserGroup);

    // Routes related to permissions attached to UserGroups
    router.post(`${userGroupBasePath}/:id/attach-permission`, controller.attachPermissionToUserGroup);
    router.post(`${userGroupBasePath}/:id/detach-permission`, controller.detachPermissionFromUserGroup);
    router.get(`${userGroupBasePath}/:id/permissions`, controller.getUserGroupPermissions);

    // // Routes related to users in UserGroups
    router.post(`${userGroupBasePath}/:id/add-user/:userId`, controller.addUserToUserGroup);
    router.post(`${userGroupBasePath}/:id/remove-user/:userId`, controller.removeUserFromUserGroup);

    // Route to get all permissions a user has
    router.get(`${userBasePath}/:userId/permissions`, controller.getUserPermissions);

    // Permission routes
    router.get(`${permissionBasePath}`, controller.getAllPermissions);
    router.get(`${permissionBasePath}/:id`, controller.getPermissionById);
}

registerRBACRoutes(rbacController);

module.exports = router;
