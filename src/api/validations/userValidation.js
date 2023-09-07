exports.isValidNumber = async (number) => {
    return /^\d{8}$/.test(number);
};

exports.isValidUEN = async (uen) => {
    return /^.{8,9}[A-Z]$/.test(uen)
}

exports.isValidEmail = async (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

exports.isValidDate = async (date) => {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime()) && parsedDate <= new Date()) {
        return true;
    }
    return false;
};

exports.isValidPassword = async (password) => {
    const passwordRegex = /^(?!.* )(?=.*\d)(?=.*[a-z]).{8,}$/;
    return passwordRegex.test(password);
};

exports.isValidNumericID = async (id) => {
    // Check if the string can be parsed into a positive integer
    const parsedId = parseInt(id, 10);
    return !isNaN(parsedId) && parsedId > 0 && parsedId.toString() === id;
};

exports.isValidAccountType = async (accountType) => {
    const AccountTypesSet = new Set(["PET_OWNER", "PET_BUSINESS", "INTERNAL_USER"]);
    if (typeof accountType !== 'string') {
        return false;
    }
    return AccountTypesSet.has(accountType);
}

