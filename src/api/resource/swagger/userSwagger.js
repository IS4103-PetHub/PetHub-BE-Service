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

/**
* @swagger
* /api/users/forget-password:
*   post:
*     summary: User forget password and wants to reset reset the password
*     description: Sends a reset password link to the email.
*     requestBody:
*       description: Email details
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/post-forget-password'
*     responses:
*       201:
*         description: forget password email sent successfully
*         content:
*           application/json:
*             schema:
*               $ref: '#/definitions/post-forget-password-response'
*     tags:
*       - Users
*/

/**
* @swagger
* /api/users/reset-password/{token}:
*   post:
*     summary: User forget password and wants to reset reset the password via reset password token
*     description: Resets the password for the user
*     parameters:
*       - name: token
*         in: path
*         description: Token of the reset-password record.
*         required: true
*         type: string
*     requestBody:
*       description: new passowrd details
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/post-reset-password-with-token'
*     responses:
*       201:
*         description: reset password successful
*         content:
*           application/json:
*             schema:
*               $ref: '#/definitions/post-reset-password-response'
*     tags:
*       - Users
*/

/**
* @swagger
* /api/users/change-password:
*   post:
*     summary: User wants to change their password
*     description: Change password for user
*     requestBody:
*       description: Authorization details and new password
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/post-change-password'
*     responses:
*       201:
*         description: Change password successful
*         content:
*           application/json:
*             schema:
*               $ref: '#/definitions/post-change-password-response'
*     tags:
*       - Users
*/

/**
* @swagger
* /api/users/{id}/activate-user:
*   patch:
*     summary: User wants to activate their account
*     description: Activate user account
*     parameters:
*       - name: id
*         in: path
*         description: id of the user to activate.
*         required: true
*         type: integer
*     requestBody:
*       description: Authorization details
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/patch-de-activate-user'
*     responses:
*       200:
*         description: User activated successfully
*         content:
*           application/json:
*             schema:
*               $ref: '#/definitions/UserResponse'
*     tags:
*       - Users

* /api/users/{id}/deactivate-user:
*   patch:
*     summary: User wants to deactivate their account
*     description: Deactivate user account
*     parameters:
*       - name: id
*         in: path
*         description: id of the user to deactivate.
*         required: true
*         type: integer
*     requestBody:
*       description: Authorization details
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/patch-de-activate-user'
*     responses:
*       200:
*         description: User deactivated successfully
*         content:
*           application/json:
*             schema:
*               $ref: '#/definitions/UserResponse'
*     tags:
*       - Users
*/


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
 *   post-forget-password:
 *     type: object
 *     properties:
 *       email:
 *         type: string
 *     example:
 *       email: "abc@example.com"
 * 
 *   post-forget-password-response:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *     example:
 *       message: "Password Reset Email sent successfully"
 * 
 *   post-reset-password-with-token:
 *     type: object
 *     properties:
 *       newPassword:
 *         type: string
 *     example:
 *       newPassword: "password123"
 * 
 *   post-reset-password-response:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *     example:
 *       message: "Password Reset successfully"
 * 
 *   post-change-password:
 *     type: object
 *     properties:
 *       email:
 *         type: string
 *       password:
 *         type: string
 *       newPassword:
 *         type: string
 *     example:
 *       email: "abc@example.com"
 *       password: "password1"
 *       newPassword: "password123"
 * 
 *   post-change-password-response:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *     example:
 *       message: "Change Password successfully"
 * 
 *   patch-de-activate-user:
 *     type: object
 *     properties:
 *       password:
 *         type: string
 *       description: The user's password for authentication.
 *     example:
 *       password: "password1"
 */