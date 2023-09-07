const prisma = require('../../../prisma/prisma');
const CustomError = require('../errors/customError');
const emailTemplate = require('../resource/emailTemplate');
const RESET_PASSWORD_EXPIRY_TIME = 15 * 60 * 1000; // 15 Minutes
const { baseUserServiceInstance } = require('./user/baseUserService');


class AuthenticationService {
    async handleResetPassword(token, newPassword) {
        try {
            const record = await this.getResetPasswordRecord(token);
            if (record.expiryDate < new Date()) {
                throw new CustomError('Password Reset Token has expired', 401);
            }

            await baseUserServiceInstance.resetPassword(record.email, newPassword);
            await this.deleteResetPasswordRecord(token);
        } catch (error) {
            if (error instanceof CustomError || error instanceof UserError) throw error; // rethrow error
            console.error("Error handling reset password request:", error);
            throw new CustomError("Error handling reset password request", 500);
        }
    }

    async handleForgetPassword(email) {
        try {
            const user = await baseUserServiceInstance.getUserByEmail(email);
            const accountType = user.accountType

            const token = UserHelper.generateUniqueToken();
            const baseurl = (accountType == "INTERNAL_USER") ? "http://localhost:3001" : "http://localhost:3002";
            const link = `${baseurl}/resetpassword?token=${token}`;
            const body = emailTemplate.forgetPasswordEmail(link);
            await this.createResetPasswordRecord(token, email);
            await EmailService.sendEmail(email, 'PetHub Forget Password', body);
        } catch (error) {
            if (error instanceof CustomError || error instanceof UserError) throw error; // rethrow error
            console.error("Error handling forget password request:", error);
            throw new CustomError("Error handling forget password request", 500);
        }
    }

    async createResetPasswordRecord(token, email) {
        try {
            const expiryDate = new Date();
            expiryDate.setTime(expiryDate.getTime() + RESET_PASSWORD_EXPIRY_TIME);
            const record = await prisma.resetPassword.create({
                data: {
                    token: token,
                    email: email,
                    expiryDate: expiryDate
                }
            });
            return record;
        } catch (error) {
            throw error;
        }
    }

    async deleteResetPasswordRecord(token) {
        try {
            await prisma.resetPassword.delete({
                where: { token }
            });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AuthenticationService();
