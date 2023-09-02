const bcrypt = require('bcrypt');

exports.authenticatePassword = async (inputPassword, password) => {
    return await bcrypt.compare(inputPassword, password)
}


exports.generateNewPassword = () => {
    const length = 8;
    const numbers = '0123456789'; 
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let password = numbers.charAt(Math.floor(Math.random() * numbers.length));

    for (let i = 1; i < length; i++) {
        const randomChoice = Math.floor(Math.random() * 2); 
        switch (randomChoice) {
            case 0:
                password += numbers.charAt(Math.floor(Math.random() * numbers.length));
                break;
            case 1:
                password += characters.charAt(Math.floor(Math.random() * characters.length));
                break;
        }
    }

    return password;
}