const bcrypt = require('bcrypt');

module.exports = {

    authenticatePassword: async (inputPassword, password) => {
        return await bcrypt.compare(inputPassword, password)
    }

}