const PermissionError = require('../../errors/PermissionError');
const CustomError = require('../../errors/customError');

const prisma = require('../../../../prisma/prisma');

class PermissionService {

    async getPermissionById(id) {
        try {
            const permission = await prisma.permission.findUnique({
                where: { permissionId: id },
            });

            if (!permission) throw new CustomError('Permission not found', 404);
            return permission;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            console.error("Error fetching permission by ID:", error);
            throw new PermissionError(error);
        }
    }

    async deletePermission(id) {
        try {
            return await prisma.permission.delete({
                where: { permissionId: id },
            });
        } catch (error) {
            console.error("Error during permission deletion:", error);
            throw new PermissionError(error);
        }
    }

    async updatePermission(id, data) {
        try {
            if (data.code) {
                throw new CustomError('Permission code is immutable and cannot be modified.', 400);
            }

            return await prisma.permission.update({
                where: { permissionId: id },
                data: {
                    name: data.name,
                    description: data.description,
                    endpoint: data.endpoint,
                    method: data.method
                },
            });
        } catch (error) {
            if (error instanceof CustomError) throw error;
            console.error("Error during permission update:", error);
            throw new PermissionError(error);
        }
    }

    async createPermission(data) {
        try {
            const permission = await prisma.permission.create({
                data: {
                    code: data.code,
                    name: data.name,
                    description: data.description,
                    endpoint: data.endpoint,
                    method: data.method
                },
            });

            return permission;
        } catch (error) {
            console.error("Error during permission creation:", error);
            throw new PermissionError(error);
        }
    }

    async getAllPermissions() {
        try {
            return await prisma.permission.findMany();
        } catch (error) {
            console.error("Error fetching all permissions", error);
            throw new PermissionError(error);
        }
    }
}

module.exports = new PermissionService();
