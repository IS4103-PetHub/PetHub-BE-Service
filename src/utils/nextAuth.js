const { decode } = require("next-auth/jwt");
require("dotenv").config();

const secret = process.env.NEXTAUTH_SECRET;

// to use:
// const token = req.headers['authorization'].split(' ')[1];
// pass token into this function to get user data
async function getUserFromToken(token) {
  try {
    const data = await decode({ token, secret }); 
    return data.user; 
  } catch (error) {
    console.error('Token decoding error:', error);
    throw error; 
  }
}

module.exports = { getUserFromToken };