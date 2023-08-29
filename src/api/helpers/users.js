const bcrypt = require('bcrypt');

module.exports = {

    hashPassword: async (password) => {
        return await bcrypt.hash(password, 10)
    }

}