const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// user endpoint health check
router.get('/', async (req, res, next) => {
  res.send({ message: 'Ok user api is working 🚀' });
});

function registerRoutes(controller, userType) {
  router.post(`/${userType}`, controller.createUser);
  router.get(`/${userType}`, controller.getAllUsers);
  router.get(`/${userType}/:id`, controller.getUserById);
  router.patch(`/${userType}/:id`, controller.updateUser);
  router.delete(`/${userType}/:id`, controller.deleteUser);
  router.post(`/forget-password`, controller.forgetPassword);
  router.post(`/reset-password/:token`, controller.resetPasswordFromEmail);
  router.post(`/change-password`, controller.changePassword)
  router.post(`/${userType}/login`, controller.loginUser);
  router.patch(`/:id/activate-user`, controller.activateUser);
  router.patch(`/:id/deactivate-user`, controller.deactivateUser);
}

// Register routes for each user type
registerRoutes(userController, 'internal-users');
registerRoutes(userController, 'pet-owners');
registerRoutes(userController, 'pet-businesses');

module.exports = router;