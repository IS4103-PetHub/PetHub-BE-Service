const UserService = require('../services/users');
const AuthHelper = require('../helpers/auth');

module.exports = {

    authenticateUser: async (req, res, next) => {
        try {
            const { username, password, userType } = req.body;
            const email = username
            const user = await UserService.getUserByEmail(email);

            if (!await AuthHelper.authenticatePassword(password, user.password)) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            if (!userType || 
                (userType == "applicationAdmin" && !user.applicationAdmin) ||
                (userType == "petOwner" && !user.petOwner) ||
                (userType == "petBusiness" && !user.petBusiness)
            ) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            if (user.applicationAdmin) {
                const admin = {
                    name: user.applicationAdmin.firstName,
                    role: "applicationAdmin",
                    userId: user.userId
                }
                return res.status(200).json(admin);
            } else if (user.petOwner) {
                const petOwner = {
                    name: user.petOwner.firstName,
                    role: "petOwner",
                    userId: user.userId
                }
                return res.status(200).json(petOwner);
            } else if (user.petBusiness) {
                const petBusiness = {
                    name: user.petBusiness.companyName,
                    role: "petBusiness",
                    userId: user.userId
                }
                return res.status(200).json(petBusiness);
            } else {
                return res.status(401).json({ message: 'Invalid user type' });
            }
        } catch (error) {
            next(error)
        }
    }
}