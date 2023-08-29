module.exports = {

    isValidNumber: async (number) => {
        return /^\d{8}$/.test(number);
    },
    isValidEmail: async (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    isValidDate: async (date) => {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime()) && parsedDate <= new Date()) {
            return true;
        }
        return false;
    },
    isValidPassword: async (password) => {
        const passwordRegex = /^(?!.* )(?=.*\d)(?=.*[a-z]).{8,}$/;
        return passwordRegex.test(password)
    },

}