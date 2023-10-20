const bcrypt = require('bcryptjs'); // bcrypt for password hashing
// const jwt = require('jsonwebtoken'); // TODO: use JWTs for authentication
const prisma = require('../../../../prisma/prisma');
const UserError = require('../../errors/userError')
const CustomError = require('../../errors/customError')
const { AccountStatus } = require('@prisma/client');
const usersHelper = require('../../helpers/usersHelper');
const emailTemplate = require('../../resource/emailTemplate');
const emailService = require("../emailService");
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
const VERIFY_EMAIL_EXPIRY_TIME = 15 * 60 * 1000;


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
  async login(email, password, userType) {
    try {
      // TODO: Generate token or create session here
      // const token = jwt.sign({ userId: user.id }, 'your_secret_key');
      // return { user, token }; 
      // to check if the user is valid
      let user = await this.verifyUserByEmail(email, password);

      // if user status is 
      if (user.accountStatus == "PENDING_VERIFICATION") {
        const record = await prisma.emailVerification.findUnique({
          where: { email: email },
        })
        // get PO/PB info
        user = await prisma.user.findUnique({
          where: { email },
          include: {
            petBusiness: true,
            petOwner: true
          }
        });
        const token = usersHelper.generateUniqueToken();
        const link = `http://localhost:3002/verify-email/?token=${token}`
        const name = user.accountType == 'PET_OWNER' ? user.petOwner.firstName : user.petBusiness.companyName;
        const body = emailTemplate.AccountEmailVerificationEmail(name, link)
        if (record) {
          // if the record is expired, resend the email
          if (record.expiryDate < new Date()) {
            this.deleteVerifyEmailRecord(record.token)
            await this.createVerifyEmailRecord(token, user.email)
            await emailService.sendEmail(user.email, "Verify Your Email Address for PetHub Registration", body)
            throw new CustomError('Account not verified, The verification email has been resent, please check your email to verify the account')
          } 
          // else throw error and ask user to check email
          else {
            throw new CustomError('Account not verified, please check your email to verify the account')
          }
        } else {
          // if user is pending verification but no record, resend the email
          await this.createVerifyEmailRecord(token, user.email)
          await emailService.sendEmail(user.email, "Verify Your Email Address for PetHub Registration", body)
          throw new CustomError('Account not verified, The verification email has been resent, please check your email to verify the account')
        }
      }

      if (user.accountType != usersHelper.mapUserType(userType)) {
        throw new CustomError('Invalid Login Credentials', 403)
      }
      return user;
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
    return this.handleUserStatusChange(userId, password, AccountStatus.ACTIVE);
  }

  async deactivateUser(userId, password) {
    return this.handleUserStatusChange(userId, password, AccountStatus.INACTIVE);
  }

  async createVerifyEmailRecord(token, email) {
    try {
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + VERIFY_EMAIL_EXPIRY_TIME);
      const record = await prisma.emailVerification.create({
        data: {
          token: token,
          email: email,
          expiryDate: expiryDate
        }
      })
      return record;
    } catch (error) {
      throw error;
    }
  }

  async deleteVerifyEmailRecord(token) {
    try {
      await prisma.emailVerification.delete({
        where: { token }
      })
    } catch (error) {
      throw error;
    }
  }

  async handleVerifyEmail(token) {
    try {
      const record = await prisma.emailVerification.findUnique({
        where: { token }
      })
      if(!record) {
        throw new CustomError('Verification Token not found', 400);
      }
      if (record.expiryDate < new Date()) {
        throw new CustomError('Verification Token has expired', 400);
      }
      const user = await this.model.findUnique({
        where: { email: record.email },
        include: {
          petBusiness: true,
          petOwner: true
        }
      });
      if (!user) throw new CustomError("User with email not found", 400)
      const updatedUser = await prisma.user.update({
        where: { email: record.email },
        data: {
          accountStatus: user.accountType == 'PET_OWNER' ? 'ACTIVE' : 'INACTIVE'
        },
      });
      await this.deleteVerifyEmailRecord(token);

      // send email to inform the verification of email
      const body = emailTemplate.ConfirmationEmailVerificationEmail(
        user.accountType == 'PET_OWNER' ? user.petOwner.firstName : user.petBusiness.companyName
      )
      await emailService.sendEmail(user.email, "PetHub Account successfully activated", body)

      return this.removePassword(updatedUser);
    } catch(error) {
      if (error instanceof CustomError || error instanceof UserError) {
        throw error;
      }
      throw new UserError(error);
    }
  }

  async resendVerifyEmail(email) {
    try{
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          petBusiness: true,
          petOwner: true
        }
      });
      // if account is already verified dont send email
      if (user.accountStatus != 'PENDING_VERIFICATION') {
        throw new CustomError('Email is already verified', 400)
      };
      
      const record = await prisma.emailVerification.findUnique({
        where: { email: email }
      })
      if(record) {
        this.deleteVerifyEmailRecord(record.token)
      }
      const name = user.petBusiness ? user.petBusiness.companyName : user.petOwner.firstName;
      const token = usersHelper.generateUniqueToken();
      const link = `http://localhost:3002/verify-email/?token=${token}`
      const body = emailTemplate.AccountEmailVerificationEmail(name, link)
      await this.createVerifyEmailRecord(token, user.email)
      await emailService.sendEmail(user.email, "Verify Your Email Address for PetHub Registration", body)
      return ;
    } catch(error) {
      if (error instanceof CustomError) throw error;
      throw new UserError(error);
    }
  }
}

module.exports = {
  BaseUserService,
  baseUserServiceInstance: new BaseUserService()
};