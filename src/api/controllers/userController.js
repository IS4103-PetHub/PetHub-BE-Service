const InternalUserService = require('../services/user/internalUserService');
const PetOwnerService = require('../services/user/petOwnerService');
const PetBusinessService = require('../services/user/petBusinessService');
const UserValidations = require('../validations/userValidation');
const UserHelper = require('../helpers/usersHelper');
const EmailService = require('../services/eamilService');
const PasswordResetService = require('../services/resetPasswordService')

const services = {
  'internal-users': InternalUserService,
  'pet-owners': PetOwnerService,
  'pet-businesses': PetBusinessService,
};

const getServiceByUserType = (req, res) => {
  const userType = req.path.match(/(internal-users|pet-owners|pet-businesses)/);
  if (userType && userType[0]) {
    const service = services[userType[0]];
    if (!service) {
      res.status(400).json({ error: 'Invalid user type' });
      return null;
    }
    return service;
  }
  res.status(400).json({ error: 'Invalid user type' });
  return null;
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
    if (!await UserValidations.isValidNumericID(userId)) {
      return res.status(400).json({ message: 'Invalid ID Format' });
    }

    const user = await service.getUserById(Number(userId))
    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

exports.updateUser = async (req, res, next) => {
  try {
    const service = getServiceByUserType(req, res);
    if (!service) return;

    const userId = req.params.id;
    if (!await UserValidations.isValidNumericID(userId)) {
      return res.status(400).json({ message: 'Invalid ID Format' });
    }

    const updateData = req.body;
    await service.updateUser(Number(userId), updateData);
    res.status(200).json(updateData);
  } catch (error) {
    next(error);
  }
};


exports.deleteUser = async (req, res, next) => {
  try {
    const service = getServiceByUserType(req, res);
    if (!service) return;

    const userId = req.params.id;
    if (!await UserValidations.isValidNumericID(userId)) {
      return res.status(400).json({ message: 'Invalid ID Format' });
    }

    await service.deleteUser(Number(userId));
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const service = getServiceByUserType(req, res);
    if (!service) return;

    const token = req.params.token;

    const { newPassword } = req.body;
    if (!await UserValidations.isValidPassword(newPassword)) {
      return res.status(400).json({ message: 'Invalid password format' });
    }

    const record = await PasswordResetService.getResetPasswordRecord(token)
    if(record.expiryDate < new Date()) return res.status(401).json({ message: 'Password Reset Token has expired'})
    
    await service.resetPassword(record.email, newPassword);
    await PasswordResetService.deleteResetPasswordRecord(token);
    res.status(200).json({ message: "Password Reset successfulyy"})
  } catch (error) {
    next(error)
  }
}

exports.forgetPassword = async (req, res, next) => {
  try {
    const service = getServiceByUserType(req, res);
    if (!service) return;

    const { email } = req.body;
    if (!await UserValidations.isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const user = await service.getUserByEmail(email);

    const token = UserHelper.generateUniqueToken();
    
    // TODO: route to main or admin portal
    const baseurl = (user.accountType == "INTERNAL_USER") ? "http://localhost:3001" : "http://localhost:3002"
    
    const link = `${baseurl}/resetpassword?token=${token}`
    const body = `
    Hello,
    
      We received a request to reset your password for your PetHub account. To reset your password, please click on the link below. This link will expire in 15 minutes for security reasons:
      
      Reset Password Link:
      ${link}
      
      If you did not request this password reset, please ignore this email, and your password will remain unchanged.
      
      For security reasons, please do not share this link with anyone. 

      Thank you for using PetHub!
      
      Regards,
      Pethub
    `;
    
    // Save the details on the resetpassword table
    await PasswordResetService.createResetPasswordRecrod(token, email)
    console.log("token", token)

    // sends email with link
    await EmailService.sendEmail(email, 'PetHub Forget Password', body)
    res.status(200).json({ message: "Password Reset Email sent successfulyy"})
  } catch (error) {
    next(error)
  }
}