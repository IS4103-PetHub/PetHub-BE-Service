const { Category } = require("@prisma/client");

exports.isValidCategory = async (strData) => {
  switch (strData) {
    case Category.PET_GROOMING:
    case Category.DINING:
    case Category.VETERINARY:
    case Category.PET_RETAIL:
    case Category.PET_BOARDING:
      return true; 
    default:
      return false; 
  }
};
