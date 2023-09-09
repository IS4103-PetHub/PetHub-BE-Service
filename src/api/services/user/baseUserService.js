const bcrypt = require('bcryptjs'); // bcrypt for password hashing
// const jwt = require('jsonwebtoken'); // TODO: use JWTs for authentication
const prisma = require('../../../../prisma/prisma');
const UserError = require('../../errors/userError')
const CustomError = require('../../errors/customError')
const { AccountStatus } = require('@prisma/client');
// Shared selection fields
const userSelectFields = {
  userId: true,
  email: true,
  password: true,
  accountType: true,
  accountStatus: true,
  dateCreated: true,
  lastUpdated: true,
};



class BaseUserService {
  constructor() {
    this.model = prisma.user; // set the model to prisma.user
  }

  // Subclasses to Override this function
  async getUserById(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { userId },
        select: userSelectFields,
      });

      if (!user) throw new CustomError('User not found', 404);
      return user;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error fetching user by ID:", error);
      throw new UserError(error);
    }
  }


  async getUserByEmail(email) {
    try {
      const user = await this.model.findUnique({
        where: { email },
        select: userSelectFields,

      });
      if (!user) throw new CustomError('User not found', 404);
      return user
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error fetching user by email:", error);
      throw new UserError(error);
    }
  }

  // Common private method for user verification
  // identifier can be either user id or email
  async verifyUser(identifier, password) {
    try {
      let user;
      if (typeof identifier === 'string' && identifier.includes('@')) {
        // Assuming it's an email
        user = await this.getUserByEmail(identifier);
      } else if (typeof identifier === 'number') {
        // Assuming it's a userId
        user = await this.getUserById(identifier);
      } else {
        throw new CustomError('Invalid identifier format', 400);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new CustomError('Incorrect password', 403);
      }

      return this.removePassword(user);
    } catch (error) {
      if (error instanceof CustomError || error instanceof UserError) {
        throw error;
      }
      console.error("Error while verifying user:", error);
      throw new UserError(error);
    }
  }

  // Verify user by email
  async verifyUserByEmail(email, password) {
    return this.verifyUser(email, password);
  }

  // Verify user by userId
  async verifyUserById(userId, password) {
    return this.verifyUser(userId, password);
  }

  // Verify user
  async login(email, password) {
    try {
      // TODO: Generate token or create session here
      // const token = jwt.sign({ userId: user.id }, 'your_secret_key');
      // return { user, token }; 
      return this.verifyUserByEmail(email, password);
    } catch (error) {
      if (error instanceof CustomError || error instanceof UserError) {
        throw error;
      }
      console.error("Error while logging in:", error);
      throw new UserError(error);
    }
  }

  async logout(user) {
    // TODO: Invalidate token or destroy session here, depending on your setup
    return true;
  }

  async resetPassword(email, newPassword) {
    try {
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          password: await this.hashPassword(newPassword),
          lastUpdated: new Date()
        },
      })
      if (!updatedUser) throw new CustomError('User not found', 404);
      console.log(`Password successfuly reset`)
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error resetting password:", error);
      throw new UserError(error);
    }
  }

  removePassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  async handleUserStatusChange(userId, password, newStatus) {
    try {
      await this.verifyUserById(userId, password);

      const updatedUser = await prisma.user.update({
        where: { userId },
        data: {
          accountStatus: newStatus,
          lastUpdated: new Date()
        },
      });

      return this.removePassword(updatedUser);
    } catch (error) {
      if (error instanceof CustomError || error instanceof UserError) {
        throw error;
      }
      console.error(`Error during user status change to ${newStatus}:`, error);
      throw new UserError(error);
    }
  }

  async activateUser(userId, password) {
    console.log("DEBUG GGGGGGG: ", password)
    return this.handleUserStatusChange(userId, password, AccountStatus.ACTIVE);
  }

  async deactivateUser(userId, password) {
    return this.handleUserStatusChange(userId, password, AccountStatus.INACTIVE);
  }

}

module.exports = {
  BaseUserService,
  baseUserServiceInstance: new BaseUserService()
};