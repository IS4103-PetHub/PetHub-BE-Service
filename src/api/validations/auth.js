module.exports = {

    validateUserType: async (userType, user) => {
        if (!userType || !(userType == "applicationAdmin" || userType == "petOwner" || userType == "petBusiness")) {
            return false
        }
        if ((userType == "applicationAdmin" && !user.applicationAdmin) ||
            (userType == "petOwner" && !user.petOwner) ||
            (userType == "petBusiness" && !user.petBusiness)) {
            return false
        }
        return true
    },

}