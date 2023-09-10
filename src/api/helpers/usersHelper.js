const bcrypt = require('bcryptjs'); // bcrypt for password hashing


exports.generateUniqueToken = () => {
    const length = 16;
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