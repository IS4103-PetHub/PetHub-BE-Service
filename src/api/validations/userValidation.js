exports.isValidNumber = async (number) => {
  return /^\d{8}$/.test(number);
};

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
