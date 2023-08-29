const UserService = require('../services/users');
const UserValidations = require('../validations/users');
const UserHelper = require('../helpers/users');

module.exports = {

    /*

    */
    getAllUsers: async (req, res, next) => {
        try {
            const users = await UserService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            next(error)
        }
    },
    getAllApplicationAdmins: async (req, res, next) => {
        try {
            const users = await UserService.getAllApplicationAdmins();
            res.status(200).json(users);
        } catch (error) {
            next(error)
        }
    },
    getAllPetOwners: async (req, res, next) => {
        try {
            const users = await UserService.getAllPetOwners();
            res.status(200).json(users);
        } catch (error) {
            next(error)
        }
    },
    getAllPetBusinesses: async (req, res, next) => {
        try {
            const users = await UserService.getAllPetBusinesses();
            res.status(200).json(users);
        } catch (error) {
            next(error)
        }
    },

    createApplicationAdmin: async (req, res, next) => {
        try {
            const adminPayload = req.body;
            if (!await UserValidations.isValidPassword(adminPayload.user.create.password)) {
                return res.status(400).json({ message: 'Invalid password format' });
            }
            adminPayload.user.create.password = await UserHelper.hashPassword(adminPayload.user.create.password);
            if (!await UserValidations.isValidEmail(adminPayload.user.create.email)) {
                return res.status(400).json({ message: 'Invalid email address' });
            }

            const admin = await UserService.createApplicationAdmin(adminPayload);
            res.sendStatus(201);
        } catch (error) {
            next(error)
        }
    },
    createPetOwner: async (req, res, next) => {
        try {
            const petOwnerPayload = req.body;
            if (!await UserValidations.isValidPassword(petOwnerPayload.user.create.password)) {
                return res.status(400).json({ message: 'Invalid password format' });
            }
            petOwnerPayload.user.create.password = await UserHelper.hashPassword(petOwnerPayload.user.create.password);
            if (!await UserValidations.isValidEmail(petOwnerPayload.user.create.email)) {
                return res.status(400).json({ message: 'Invalid email address' });
            }
            if (!await UserValidations.isValidNumber(petOwnerPayload.contactNumber)) {
                return res.status(400).json({ message: 'Invalid Contact Number format' });
            }
            if (!await UserValidations.isValidDate(petOwnerPayload.dateOfBirth)) {
                return res.status(400).json({ message: 'Invalid Date' });
            }

            await UserService.createPetOwner(petOwnerPayload);
            res.sendStatus(201);
        } catch (error) {
            next(error)
        }
    },
    createPetBusiness: async (req, res, next) => {
        try {
            const petBusinessPayload = req.body;
            if (!await UserValidations.isValidPassword(petBusinessPayload.user.create.password)) {
                return res.status(400).json({ message: 'Invalid password format' });
            }
            petBusinessPayload.user.create.password = await UserHelper.hashPassword(petBusinessPayload.user.create.password);
            if (!await UserValidations.isValidEmail(petBusinessPayload.user.create.email)) {
                return res.status(400).json({ message: 'Invalid email address' });
            }
            if (!await UserValidations.isValidNumber(petBusinessPayload.contactNumber)) {
                return res.status(400).json({ message: 'Invalid Contact Number format' });
            }

            await UserService.createPetBusiness(petBusinessPayload);
            res.sendStatus(201);
        } catch (error) {
            next(error)
        }
    }


}