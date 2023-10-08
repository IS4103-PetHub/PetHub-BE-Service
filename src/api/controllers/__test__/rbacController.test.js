const {
    createUserGroup,
    getAllUserGroups,
    getUserGroupById,
    updateUserGroup,
    deleteUserGroup,
    getAllPermissions,
    getPermissionById,
    attachPermissionToUserGroup,
    detachPermissionFromUserGroup,
    getUserGroupPermissions,
    addUserToUserGroup,
    removeUserFromUserGroup,
    getUserPermissions,
} = require('../rbacController');

const userGroupService = require('../../services/rbac/userGroupService');
const rbacService = require('../../services/rbac/rbacService');
const permissionService = require('../../services/rbac/permissionService');
const UserGroupError = require('../../errors/userGroupError')
const RbacError = require('../../errors/rbacError')
const { Response } = require('jest-express/lib/response');
const { Request } = require('jest-express/lib/request');

jest.mock('../../services/rbac/userGroupService');
jest.mock('../../services/rbac/rbacService');
jest.mock('../../services/rbac/permissionService');

describe('RBAC Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = new Request();
        res = new Response();
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a user group', async () => {
        req.setBody({ name: 'Test Group', description: 'Test Description' });
        userGroupService.createUserGroup.mockResolvedValue({ id: 1, name: 'Test Group', description: 'Test Description' });

        await createUserGroup(req, res, next);
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ id: 1, name: 'Test Group', description: 'Test Description' });
    });

    it('should retrieve all user groups', async () => {
        userGroupService.getAllUserGroups.mockResolvedValue([{ id: 1, name: 'Test Group', description: 'Test Description' }]);

        await getAllUserGroups(req, res, next);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{ id: 1, name: 'Test Group', description: 'Test Description' }]);
    });

    it('should retrieve a user group by its ID', async () => {
        const testId = '1';
        req.setParams({ id: testId });
        userGroupService.getUserGroupById.mockResolvedValue({ id: 1, name: 'Test Group' });

        await getUserGroupById(req, res, next);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ id: 1, name: 'Test Group' });
    });

    it('should fail retrieving a user group by a non-numeric ID', async () => {
        req.setParams({ id: 'invalid_id' });

        await getUserGroupById(req, res, next);

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ message: 'Invalid ID Format' });
    });

    it('should update a user group', async () => {
        const testId = '1';
        const testData = { name: 'Updated Name' };
        req.setParams({ id: testId });
        req.setBody(testData);

        userGroupService.updateUserGroup.mockResolvedValue({ id: 1, name: 'Updated Name' });

        await updateUserGroup(req, res, next);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ id: 1, name: 'Updated Name' });
    });

    it('should delete a user group', async () => {
        const testId = '1';
        req.setParams({ id: testId });

        userGroupService.deleteUserGroup.mockResolvedValue();

        await deleteUserGroup(req, res, next);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'User group deleted successfully' });
    });

    it('should retrieve all permissions', async () => {
        permissionService.getAllPermissions.mockResolvedValue([{ id: 1, name: 'Read' }]);

        await getAllPermissions(req, res, next);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{ id: 1, name: 'Read' }]);
    });

    it('should retrieve a permission by its ID', async () => {
        const testId = '1';
        req.setParams({ id: testId });
        permissionService.getPermissionById.mockResolvedValue({ id: 1, name: 'Read' });

        await getPermissionById(req, res, next);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ id: 1, name: 'Read' });
    });

    it('should attach permissions to a user group', async () => {
        const testId = '1';
        const permissionIds = ['1', '2'];
        req.setParams({ id: testId });
        req.setBody({ permissionIds });

        rbacService.attachPermissionToUserGroup.mockResolvedValue([{ id: 1 }, { id: 2 }]);

        await attachPermissionToUserGroup(req, res, next);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should detach permissions from a user group', async () => {
        const testId = '1';
        const permissionIds = ['1'];
        req.setParams({ id: testId });
        req.setBody({ permissionIds });

        rbacService.detachPermissionFromUserGroup.mockResolvedValue([{ id: 1 }]);

        await detachPermissionFromUserGroup(req, res, next);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{ id: 1 }]);
    });

    it('should retrieve permissions of a user group', async () => {
        const testId = '1';
        req.setParams({ id: testId });

        rbacService.getUserGroupPermissions.mockResolvedValue([{ id: 1, name: 'Read' }]);

        await getUserGroupPermissions(req, res, next);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{ id: 1, name: 'Read' }]);
    });

    it('should fail creating a user group without a name', async () => {
        req.setBody({ description: 'Test Description' });
        await createUserGroup(req, res, next);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ message: 'Invalid payload. Both name and description must be valid.' });
    });

    it('should fail creating a user group with existing name', async () => {
        req.setBody({ name: 'Test Group', description: 'Test Description' });

        // Mocking an error instance similar to UserGroupError for the specific condition
        const err = new UserGroupError({
            code: 'P2002',
            meta: { target: ['name'] }
        });
        err.statusCode = 400;

        userGroupService.createUserGroup.mockRejectedValue(err);

        await createUserGroup(req, res, next);

        // Ensure that the 'next' function is called with the error
        expect(next).toHaveBeenCalledWith(err);
    });

    it('should handle unexpected errors when creating a user group', async () => {
        req.setBody({ name: 'Test Group', description: 'Test Description' });
        userGroupService.createUserGroup.mockRejectedValue(new Error("Unexpected Error"));

        await createUserGroup(req, res, next);
        expect(next).toHaveBeenCalledWith(new Error("Unexpected Error"));
    });

    it('should add a user to a user group', async () => {
        const testGroupId = '1';
        const testUserId = '2';
        req.setParams({ id: testGroupId, userId: testUserId });

        await addUserToUserGroup(req, res, next);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'User added to user group successfully' });
    });

    it('should fail adding a user to a user group with invalid group ID format', async () => {
        const testGroupId = 'invalid_id';
        const testUserId = '2';
        req.setParams({ id: testGroupId, userId: testUserId });

        await addUserToUserGroup(req, res, next);

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ message: 'Invalid ID Format' });
    });

    it('should fail adding a user to a user group with invalid user ID format', async () => {
        const testGroupId = '1';
        const testUserId = 'invalid_id';
        req.setParams({ id: testGroupId, userId: testUserId });

        await addUserToUserGroup(req, res, next);

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ message: 'Invalid ID Format' });
    });


    it('should fail adding a user to a non-existing user group', async () => {
        const testGroupId = '3'; // Assuming this ID doesn't exist in the database
        const testUserId = '1'; // Assuming this is a valid user ID
        req.setParams({ id: testGroupId, userId: testUserId });

        // Mocking an error instance similar to RbacError for the specific condition
        const err = new RbacError({
            code: 'P2003',
            meta: { target: ['userId'] }
        });
        err.statusCode = 400;
        rbacService.addUserToUserGroup.mockRejectedValue(err);
        await addUserToUserGroup(req, res, next);

        // Ensure that the 'next' function is called with the error
        expect(next).toHaveBeenCalledWith(err);
    });

    it('should fail removing a user from a non-existing user group', async () => {
        const testGroupId = '3'; // Assuming this ID doesn't exist in the database
        const testUserId = '1'; // Assuming this is a valid user ID
        req.setParams({ id: testGroupId, userId: testUserId });

        // Mocking an error instance similar to RbacError for the specific condition
        const err = new RbacError({
            code: 'P2003',
            meta: { target: ['userId'] }
        });
        err.statusCode = 400;
        rbacService.removeUserFromUserGroup.mockRejectedValue(err);
        await removeUserFromUserGroup(req, res, next);

        // Ensure that the 'next' function is called with the error
        expect(next).toHaveBeenCalledWith(err);
    });

    it('should fail getting permissions for a non-existing user', async () => {
        const testUserId = '3'; // Assuming this ID doesn't exist in the database
        req.setParams({ userId: testUserId });

        // Mocking an error instance similar to RbacError for the specific condition
        const err = new RbacError({
            code: 'P2003',
            meta: { target: ['userId'] }
        });
        err.statusCode = 400;

        rbacService.getUserPermissions.mockRejectedValue(err);
        await getUserPermissions(req, res, next);

        // Ensure that the 'next' function is called with the error
        expect(next).toHaveBeenCalledWith(err);
    });
});


