const userValidations = require('./userValidation');
const rbacValidations = require('./rbacValidations');

// Re-export functions
module.exports = {
    ...userValidations,
    ...rbacValidations
};
