const InternalUserService = require('../services/user/internalUserService');
const PetOwnerService = require('../services/user/petOwnerService');
const PetBusinessService = require('../services/user/petBusinessService');
const UserValidations = require('../validations/users');
const UserHelper = require('../helpers/users');

const services = {
  'internal-users': InternalUserService,
  'pet-owners': PetOwnerService,
  'pet-businesses': PetBusinessService,
};

const getServiceByUserType = (req, res) => {
  const userType = req.path.split('/').slice(-1)[0];  // Take the last segment after splitting
  const service = services[userType];
  if (!service) {
    res.status(400).json({ error: 'Invalid user type' });
    return null;
  }
  return service;
};

// Login and Logout
exports.loginUser = async (req, res, next) => {
  try {
    const service = getServiceByUserType(req, res);
    if (!service) return;

    const { email, password } = req.body;
    const user = await service.login(email, password);
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
    res.json({ message: 'Logged out successfully' });
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
    if (!await UserValidations.isValidPassword(userPayload.password)) {
      return res.status(400).json({ message: 'Invalid password format' });
    }
    // userPayload.password = await UserHelper.hashPassword(userPayload.password);
    if (!await UserValidations.isValidEmail(userPayload.email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    console.log(userPayload)
    // Note: Validation for contact number and date of birth
    // can be performed within the specific service.
    await service.createUser(userPayload);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const service = getServiceByUserType(req, res);
    if (!service) return;

    const users = await service.getAllPetOwners();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const service = getServiceByUserType(req, res);
    if (!service) return;

    const userId = req.params.id;
    const updateData = req.body;
    await service.updateUser(userId, updateData);
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};


exports.deleteUser = async (req, res, next) => {
  try {
    const service = getServiceByUserType(req, res);
    if (!service) return;

    const userId = req.params.id;
    await service.deleteUser(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

