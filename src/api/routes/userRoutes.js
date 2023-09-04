const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Check API health
 *     description: Check if the user API is working.
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Status message
 *     tags:
 *       - Health
 */
// user endpoint health check
router.get('/', async (req, res, next) => {
  res.send({ message: 'Ok user api is working 🚀' });
});

function registerRoutes(controller, userType) {
  /**
   * @swagger
   * /api/users/internal-users:
   *   post:
   *     summary: Create a new internal user.
   *     description: Create a new internal user.
   *     requestBody:
   *       description: Internal user details.
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/definitions/PostInternalUser'
   *     responses:
   *       201:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/definitions/UserResponse'
   *     tags:
   *       - Users
   */



  /**
   * @swagger
   * /api/users/pet-businesses:
   *   post:
   *     summary: Create a new pet business.
   *     description: Create a new pet business.
   *     requestBody:
   *       description: Pet Business details.
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/definitions/PostPetBusiness'
   *     responses:
   *       201:
   *         description: Pet business created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/definitions/UserResponse'
   *     tags:
   *       - Users
   */

  /**
   * @swagger
   * /api/users/pet-owners:
   *   post:
   *     summary: Create a new pet owner.
   *     description: Create a new pet owner.
   *     requestBody:
   *       description: Pet Owner details.
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/definitions/PostPetOwner'
   *     responses:
   *       201:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/definitions/UserResponse'
   *     tags:
   *       - Users
   */
  router.post(`/${userType}`, controller.createUser);

  /**
 * @swagger
 * /api/users/internal-users:
 *   get:
 *     summary: Get all internal users.
 *     description: Retrieve a list of all internal users.
 *     responses:
 *       200:
 *         description: List of internal users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/InternalUserResponse'
 *     tags:
 *       - Users
 */

  /**
 * @swagger
 * /api/users/pet-owners:
 *   get:
 *     summary: Get all pet owners.
 *     description: Retrieve a list of all pet owners.
 *     responses:
 *       200:
 *         description: List of pet owners retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/PetOwnerResponse'
 *     tags:
 *       - Users
 */

  /**
   * @swagger
   * /api/users/pet-businesses:
   *   get:
   *     summary: Get all pet businesses.
   *     description: Retrieve a list of all pet businesses.
   *     responses:
   *       200:
   *         description: List of pet businesses retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/definitions/PetBusinessResponse'
   *     tags:
   *       - Users
   */

  router.get(`/${userType}`, controller.getAllUsers);
  /**
   * @swagger
   * /api/users/internal-users/{id}:
   *   get:
   *     summary: Get a specific internal user by ID.
   *     description: Retrieve a specific internal user by their unique ID.
   *     parameters:
   *       - name: id
   *         in: path
   *         description: The ID of the internal user to retrieve.
   *         required: true
   *         type: integer
   *     responses:
   *       200:
   *         description: Internal user retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/definitions/InternalUserResponse'
   *       404:
   *         description: Internal user not found.
   *     tags:
   *       - Users
   */

  /**
   * @swagger
   * /api/users/pet-owners/{id}:
   *   get:
   *     summary: Get a specific pet owner by ID.
   *     description: Retrieve a pet owner by their unique ID.
   *     parameters:
   *       - name: id
   *         in: path
   *         description: The ID of the pet owner to retrieve.
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Pet owner retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/definitions/PetOwnerResponse'
   *       404:
   *         description: Pet owner not found.
   *     tags:
   *       - Users
   */


  /**
 * @swagger
 * /api/users/pet-businesses/{id}:
 *   get:
 *     summary: Get a specific pet business by ID.
 *     description: Retrieve a pet business by its unique ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the pet business to retrieve.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pet business retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/PetBusinessResponse'
 *       404:
 *         description: Pet business not found.
 *     tags:
 *       - Users
 */

  router.get(`/${userType}/:id`, controller.getUserById);

  /**
 * @swagger
 * /api/users/internal-users/{id}:
 *   patch:
 *     summary: Update a specific internal user by ID.
 *     description: Update the details of a specific internal user by their unique ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the internal user to update.
 *         required: true
 *         type: integer
 *     requestBody:
 *       description: Updated internal user details.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/PutInternalUser'
 *     responses:
 *       200:
 *         description: Internal user updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/PutInternalUser'
 *       404:
 *         description: Internal user not found.
 *     tags:
 *       - Users
 */

  /**
 * @swagger
 * /api/users/pet-owners/{id}:
 *   patch:
 *     summary: Update a specific pet owner by ID.
 *     description: Update the details of a specific pet owner by their unique ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the pet owner to update.
 *         required: true
 *         type: integer
 *     requestBody:
 *       description: Updated pet owner details.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/PutPetOwner'
 *     responses:
 *       200:
 *         description: Pet owner updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/PutPetOwner'
 *       404:
 *         description: Pet owner not found.
 *     tags:
 *       - Users
 */


  /**
 * @swagger
 * /api/users/pet-businesses/{id}:
 *   patch:
 *     summary: Update a specific pet business by ID.
 *     description: Update the details of a specific pet business by their unique ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the pet business to update.
 *         required: true
 *         type: integer
 *     requestBody:
 *       description: Updated pet business details.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/PutPetBusiness'
 *     responses:
 *       200:
 *         description: Pet business updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/PutPetBusiness'
 *       404:
 *         description: Pet business not found.
 *     tags:
 *       - Users
 */


  router.patch(`/${userType}/:id`, controller.updateUser);

  /**
 * @swagger
 * /api/users/internal-users/{id}:
 *   delete:
 *     summary: Delete a specific internal user by ID.
 *     description: Delete a specific internal user by their unique ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the internal user to delete.
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Internal user deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message indicating the user deletion.
 *       404:
 *         description: Internal user not found.
 *     tags:
 *       - Users
 */

  /**
 * @swagger
 * /api/users/pet-owners/{id}:
 *   delete:
 *     summary: Delete a specific pet owner by ID.
 *     description: Delete a specific pet owner by their unique ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the pet owner to delete.
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Pet owner deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message indicating the user deletion.
 *       404:
 *         description: Pet owner not found.
 *     tags:
 *       - Users
 */

  /**
 * @swagger
 * /api/users/pet-businesses/{id}:
 *   delete:
 *     summary: Delete a specific pet business by ID.
 *     description: Delete a specific pet business by their unique ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the pet business to delete.
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Pet business deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message indicating the user deletion.
 *       404:
 *         description: Pet business not found.
 *     tags:
 *       - Users
 */

  router.delete(`/${userType}/:id`, controller.deleteUser);
}

// Register routes for each user type
registerRoutes(userController, 'internal-users');
registerRoutes(userController, 'pet-owners');
registerRoutes(userController, 'pet-businesses');

module.exports = router;

/**
 * @swagger
 * definitions:
 *   PostInternalUser:
 *     type: object
 *     properties:
 *       firstName:
 *         type: string
 *       lastName:
 *         type: string
 *       adminRole:
 *         type: string
 *       email:
 *         type: string
 *       password:
 *         type: string
 *     example:
 *       firstName: "John1"
 *       lastName: "Doe1"
 *       adminRole: "ADMINISTRATOR"
 *       email: "admin1@example.com"
 *       password: "password1"
 *
 *   PostPetBusiness:
 *     type: object
 *     properties:
 *       companyName:
 *         type: string
 *       contactNumber:
 *         type: string
 *       uen:
 *         type: string
 *       email:
 *         type: string
 *       password:
 *         type: string
 *     example:
 *       companyName: "abcd company"
 *       contactNumber: "12345678"
 *       uen: "1234568798"
 *       email: "petBusiness65@example.com"
 *       password: "password1"
 * 
 *   PostPetOwner:
 *     type: object
 *     properties:
 *       firstName:
 *         type: string
 *       lastName:
 *         type: string
 *       contactNumber:
 *         type: string
 *       dateOfBirth:
 *         type: string
 *         format: date-time
 *       email:
 *         type: string
 *       password:
 *         type: string
 *     example:
 *       firstName: "John1"
 *       lastName: "Doe1"
 *       contactNumber: "12345678"
 *       dateOfBirth: "1990-01-15T00:00:00Z"
 *       email: "petowner@example.com"
 *       password: "password1"
 * 
 *   UserResponse:
 *     type: object
 *     properties:
 *       userId:
 *         type: integer
 *         description: The user ID
 *       email:
 *         type: string
 *         description: The user's email
 *       accountType:
 *         type: string
 *         description: The type of user account
 *       accountStatus:
 *         type: string
 *         description: The account status
 *       dateCreated:
 *         type: string
 *         format: date-time
 *         description: The date and time when the user was created
 *       lastUpdated:
 *         type: string
 *         format: date-time
 *         description: The date and time of the last update (can be null)
 *
 *   PetOwnerResponse:
 *     type: object
 *     properties:
 *       firstName:
 *         type: string
 *       lastName:
 *         type: string
 *       contactNumber:
 *         type: string
 *       dateOfBirth:
 *         type: string
 *         format: date-time
 *       userId:
 *         type: integer
 *       user:
 *         $ref: '#/definitions/UserResponse'
 *     example:
 *       firstName: "John1"
 *       lastName: "Doe1"
 *       contactNumber: "12345678"
 *       dateOfBirth: "1990-01-15T00:00:00Z"
 *       userId: 1
 *       user:
 *         userId: 1
 *         email: "petowner@example.com"
 *         accountType: "Pet Owner"
 *         accountStatus: "Active"
 *         dateCreated: "2023-09-04T10:00:00Z"
 *         lastUpdated: "2023-09-04T10:30:00Z"
 * 
 *   InternalUserResponse:
 *     type: object
 *     properties:
 *       firstName:
 *         type: string
 *       lastName:
 *         type: string
 *       adminRole:
 *         type: string
 *       userId:
 *         type: integer
 *       user:
 *         $ref: '#/definitions/UserResponse'
 *     example:
 *       firstName: "John1"
 *       lastName: "Doe1"
 *       adminRole: "ADMINISTRATOR"
 *       userId: 1
 *       user:
 *         userId: 1
 *         email: "internaluser@example.com"
 *         accountType: "Internal User"
 *         accountStatus: "Active"
 *         dateCreated: "2023-09-04T10:00:00Z"
 *         lastUpdated: "2023-09-04T10:30:00Z"
 * 
 *   PetBusinessResponse:
 *     type: object
 *     properties:
 *       companyName:
 *         type: string
 *       uen:
 *         type: string
 *       businessType:
 *         type: string
 *       businessDescription:
 *         type: string
 *       contactNumber:
 *         type: string
 *       websiteURL:
 *         type: string
 *       userId:
 *         type: integer
 *       user:
 *         $ref: '#/definitions/UserResponse'
 *     example:
 *       companyName: "ABC Pet Services"
 *       uen: "123456789A"
 *       businessType: "Pet Grooming"
 *       businessDescription: "We provide pet grooming services."
 *       contactNumber: "98765432"
 *       websiteURL: "https://www.abcpetservices.com"
 *       userId: 1
 *       user:
 *         userId: 1
 *         email: "petbusiness@example.com"
 *         accountType: "Pet Business"
 *         accountStatus: "Active"
 *         dateCreated: "2023-09-04T10:00:00Z"
 *         lastUpdated: "2023-09-04T10:30:00Z"
 * 
 *   PutInternalUser:
 *     type: object
 *     properties:
 *       firstName:
 *         type: string
 *       lastName:
 *         type: string
 *       adminRole:
 *         type: string
 *         enum:
 *           - MANAGER
 *           - ADMINISTRATOR
 *     example:
 *       firstName: "John1"
 *       lastName: "Doe1"
 *       adminRole: "ADMINISTRATOR"
 * 
 *   PutPetOwner:
 *     type: object
 *     properties:
 *       firstName:
 *         type: string
 *       lastName:
 *         type: string
 *       contactNumber:
 *         type: string
 *       dateOfBirth:
 *         type: string
 *         format: date-time
 *     example:
 *       firstName: "John1"
 *       lastName: "Doe1"
 *       contactNumber: "12345678"
 *       dateOfBirth: "1990-01-15T00:00:00Z"
 * 
 *   PutPetBusiness:
 *     type: object
 *     properties:
 *       companyName:
 *         type: string
 *       uen:
 *         type: string
 *       businessType:
 *         type: string
 *         enum:
 *           - FNB
 *           - SERVICE
 *           - HEALTHCARE
 *       businessDescription:
 *         type: string
 *       contactNumber:
 *         type: string
 *       websiteURL:
 *         type: string
 *     example:
 *       companyName: "abcd company"
 *       uen: "1234568798"
 *       businessType: "SERVICE"
 *       businessDescription: "Updated pet service company"
 *       contactNumber: "98765432"
 *       websiteURL: "www.updatedabcd.com"
 * 
 */