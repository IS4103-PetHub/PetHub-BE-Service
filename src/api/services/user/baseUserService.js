const bcrypt = require('bcryptjs'); // bcrypt for password hashing
// const jwt = require('jsonwebtoken'); // TODO: use JWTs for authentication
const prisma = require('../../../../prisma/prisma');

class BaseUserService {
  constructor() {
    this.model = prisma.user; // set the model to prisma.user
  }

  async login(email, password) {
    try {
      const user = await this.model.findUnique({ where: { email } });
      if (!user) {
        throw new Error('User not found');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      // TODO: Generate token or create session here
      // const token = jwt.sign({ userId: user.id }, 'your_secret_key');
      // return { user, token }; 
      return user;
    } catch (error) {
      console.error("Error during login:", error);
      throw error; // propagate the error up so that it can be handled by the caller
    }
  }

  async logout(user) {
    // TODO: Invalidate token or destroy session here, depending on your setup
    return true;
  }

  removePassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }
}

module.exports = BaseUserService;
