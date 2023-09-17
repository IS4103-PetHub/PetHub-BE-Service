const InternalUserService = require('../services/user/internalUserService');
const PetOwnerService = require('../services/user/petOwnerService');
const PetBusinessService = require('../services/user/petBusinessService');
const UserValidations = require('../validations/userValidation');
const BaseValidations = require("../validations/baseValidation");
const AuthenticationService = require('../services/authenticationService');
const CustomError = require('../errors/customError');
const { baseUserServiceInstance } = require('../services/user/baseUserService');

const services = {
  "internal-users": InternalUserService,
  "pet-owners": PetOwnerService,
  "pet-businesses": PetBusinessService,
};

const getServiceByUserType = (req, res) => {
  const userType = req.path.match(/(internal-users|pet-owners|pet-businesses)/);
  if (userType && userType[0]) {
    const service = services[userType[0]];
    if (service) return service;
  }
  res.status(400).json({ error: "Invalid user type" });
  return null;
};

// Login and Logout
exports.loginUser = async (req, res, next) => {
  try {
    const service = getServiceByUserType(req, res);
    if (!service) return;

    const { email, password } = req.body;
    const userType = req.params.userType;
    const user = await service.login(email, password, userType);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.logoutUser = async (req, res, next) => {
  try {
    const service = getServiceByUserType(req, res);
    if (!service) return;

    const user = req.user; // Assuming user is set in request object
    await service.logout(user);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// CREATE, RETRIEVE, UPDATE, DELETE

exports.createUser = async (req, res, next) => {
  try {
    const service = getServiceByUserType(req, res);
    if (!service) return;

    const userPayload = req.body;
    if (!(await UserValidations.isValidPassword(userPayload.password))) {
      return res.status(400).json({ message: "Invalid password format" });
    }
    // userPayload.password = await UserHelper.hashPassword(userPayload.password);
    if (!(await UserValidations.isValidEmail(userPayload.email))) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Note: Validation for contact number and date of birth
    // can be performed within the specific service.
    const userData = await service.createUser(userPayload);
    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const service = getServiceByUserType(req, res);
    if (!service) return;

    const users = await service.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const service = getServiceByUserType(req, res);
    if (!service) return;

    const userId = req.params.id;
    if (!(await BaseValidations.isValidNumber(userId))) {
      return res.status(400).json({ message: "Invalid ID Format" });
    }

    const user = await service.getUserById(Number(userId));
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const service = getServiceByUserType(req, res);
    if (!service) return;

    const userId = req.params.id;
    if (!(await BaseValidations.isValidNumber(userId))) {
      return res.status(400).json({ message: "Invalid ID Format" });
    }

    
    const updateData = req.body;
    if (updateData.email && !(await UserValidations.isValidEmail(updateData.email))) {
      return res.status(400).json({ message: "Invalid Email Format"})
    }
    const updatedUser = await service.updateUser(Number(userId), updateData);
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const service = getServiceByUserType(req, res);
    if (!service) return;

    const userId = req.params.id;
    if (!(await BaseValidations.isValidNumber(userId))) {
      return res.status(400).json({ message: "Invalid ID Format" });
    }

    await service.deleteUser(Number(userId));
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};


/*
***************************************************************************
 * COMMON USER FUNCTIONS
**************************************************************************
*/
exports.resetPasswordFromEmail = async (req, res, next) => {
  try {
    const token = req.params.token;
    const { newPassword } = req.body;
    if (!await UserValidations.isValidPassword(newPassword)) {
      throw new CustomError('Invalid password format', 400);
    }

    await AuthenticationService.handleResetPassword(token, newPassword);
    res.status(200).json({ message: "Password Reset successfully" });
  } catch (error) {
    next(error);
  }
}

exports.forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!await UserValidations.isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    await AuthenticationService.handleForgetPassword(email);
    res.status(200).json({ message: "Password Reset Email sent successfully" });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { email, password, newPassword } = req.body;

    if (newPassword == password) {
      return res.status(400).json( {message: 'New password must be different from the old password'})
    }

    if (!await UserValidations.isValidPassword(newPassword) || !await UserValidations.isValidPassword(newPassword)) {
      return res.status(400).json({ message: 'Invalid password format' });
    }

    if (!await UserValidations.isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    await baseUserServiceInstance.verifyUserByEmail(email, password)
    await baseUserServiceInstance.resetPassword(email, newPassword)
    res.status(200).json({ message: "Change Password successfullyy" });
  } catch (error) {
    next(error)
  }
}

exports.activateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (!await BaseValidations.isValidNumber(userId)) {
      return res.status(400).json({ message: 'Invalid ID Format' });
    }

    const activateUserPayload = req.body;
    if (!activateUserPayload || !await UserValidations.isValidPassword(activateUserPayload.password)) {
      return res.status(400).json({ message: 'Invalid password format' });
    }

    await baseUserServiceInstance.activateUser(Number(userId), activateUserPayload.password);
    res.status(200).json({ message: 'User activated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deactivateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (!await BaseValidations.isValidNumber(userId)) {
      return res.status(400).json({ message: 'Invalid ID Format' });
    }

    const deactivateUserPayload = req.body;

    if (!deactivateUserPayload || !await UserValidations.isValidPassword(deactivateUserPayload.password)) {
      return res.status(400).json({ message: 'Invalid password format' });
    }

    await baseUserServiceInstance.deactivateUser(Number(userId), deactivateUserPayload.password);
    res.status(200).json({ message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
};