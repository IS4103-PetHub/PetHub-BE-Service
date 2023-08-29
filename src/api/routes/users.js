const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');

router.use('/users', router);

/*
    GET USERS
*/
router.get('/', UserController.getAllUsers);
router.get('/application-admins', UserController.getAllApplicationAdmins);
router.get('/pet-owners', UserController.getAllPetOwners);
router.get('/pet-businesses', UserController.getAllPetBusinesses);


/*
    POST USERS
*/
router.post('/application-admins', UserController.createApplicationAdmin);
router.post('/pet-owners', UserController.createPetOwner);
router.post('/pet-businesses', UserController.createPetBusiness);

module.exports = router;