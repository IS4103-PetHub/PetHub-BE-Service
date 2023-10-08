const { Gender, PetType } = require("@prisma/client");

exports.isValidGender = async (strData) => {
  switch (strData) {
    case Gender.MALE:
    case Gender.FEMALE:
      return true;
    default:
      return false;
  }
};

exports.isValidPetType = async (strData) => {
  switch (strData) {
    case PetType.DOG:
    case PetType.CAT:
    case PetType.BIRD:
    case PetType.TERRAPIN:
    case PetType.RABBIT:
    case PetType.RODENT:
    case PetType.OTHERS:
      return true;
    default:
      return false;
  }
};
