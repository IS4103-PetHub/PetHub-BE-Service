const bcrypt = require('bcryptjs'); // bcrypt for password hashing

module.exports = {

    hashPassword: async (password) => {
        return await bcrypt.hash(password, 10)
    }

}