const BaseValidations = require("../validations/baseValidation");
const PetService = require("../services/user/petService");
const constants = require("../../constants/common");
const PetValidation = require("../validations/petValidation");
const limitations = constants.limitations;
const errorMessages = constants.errorMessages;
const s3ServiceInstance = require("../services/s3Service.js");
const { pet } = require("../../../prisma/prisma");

exports.createPet = async (req, res, next) => {
  try {
    const data = req.body;
    if (
      !data.petName ||
      !data.petType ||
      !data.gender  ||
      !data.petOwnerId
    ) {
      return res.status(400).json({
        message: "Incomplete form data. Please fill in all required fields.",
      });
    }

    if (
      !(await BaseValidations.isValidLength(data.petName, limitations.TAG_LENGTH))
    ) {
      return res.status(400).json({
        message: errorMessages.INVALID_PET,
      });
    }

    if (!(await PetValidation.isValidGender(data.gender))) {
      return res.status(400).json({ message: errorMessages.INVALID_GENDER });
    }

    if (!(await PetValidation.isValidPetType(data.petType))) {
      return res.status(400).json({ message: errorMessages.INVALID_PET_TYPE });
    }

    if (!(await BaseValidations.isValidInteger(data.petOwnerId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }
    data.petOwnerId = parseInt(data.petOwnerId, 10);

    // Date function has in built validation for data.dataOfBirth user input
    if (data.dateOfBirth) {
      data.dateOfBirth = new Date(data.dateOfBirth).toISOString();
    }

    if (data.weight && !(await BaseValidations.isValidFloat(data.weight))) {
      return res
        .status(400)
        .json({ message: errorMessages.INVALID_WEIGHT });
    }
    data.weight = parseFloat(data.weight);

    if (req.files) {
      data.attachmentKeys = await s3ServiceInstance.uploadPdfFiles(req.files);
      data.attachmentURLs = await s3ServiceInstance.getObjectSignedUrl(
        data.attachmentKeys
      );
    }

    const pet = await PetService.createPet(data);
    res.status(201).json(pet);
  } catch (error) {
    next(error);
  }
};

exports.updatePet = async (req, res, next) => {
  try {
    const updateData = req.body;
    let petId = req.params.id;
    if (!(await BaseValidations.isValidInteger(petId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }
    petId = parseInt(petId, 10)

    if (updateData.petName && !(await BaseValidations.isValidLength(updateData.petName, limitations.TAG_LENGTH))
    ) { return res.status(400).json({ message: errorMessages.INVALID_PET });
    }

    if (updateData.gender && !(await PetValidation.isValidGender(updateData.gender))) {
      return res.status(400).json({ message: errorMessages.INVALID_GENDER });
    }

    if (updateData.petType && !(await PetValidation.isValidPetType(updateData.petType))) {
      return res.status(400).json({ message: errorMessages.INVALID_PET_TYPE });
    }

    // Date function has in built validation for dataOfBirth user input
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth).toISOString();
    }

    if (updateData.weight && !(await BaseValidations.isValidFloat(updateData.weight))) {
      return res
        .status(400)
        .json({ message: errorMessages.INVALID_WEIGHT });
    }
    updateData.weight = parseFloat(updateData.weight);

    if (req.files && req.files.length > 0) {
      // delete existing files and update with new files
      await PetService.deleteFilesOfAPet(petId);
      updateData.attachmentKeys = await s3ServiceInstance.uploadImgFiles(req.files);
      updateData.attachmentURLs = await s3ServiceInstance.getObjectSignedUrl(
        updateData.attachmentKeys
      );
    }

    const updatedPet = await PetService.updatePet(petId, updateData);
    res.status(200).json(updatedPet);
  } catch (error) {
    next(error);
  }
};

exports.getAllPets = async (req, res, next) => {
  try {
    const pets = await PetService.getAllPets();
    res.status(200).json(pets);
  } catch (error) {
    next(error);
  }
};

exports.getPetById = async (req, res, next) => {
  try {
    const petId = req.params.id;
    if (!(await BaseValidations.isValidInteger(petId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    const pet = await PetService.getPetById(Number(petId));
    res.status(200).json(pet);
  } catch (error) {
    next(error);
  }
};

exports.getPetsByPOId = async (req, res, next) => {
  try {
    const petOwnerId = req.params.id;
    if (!petOwnerId) {
      return res
        .status(400)
        .json({ message: "Pet Owner ID cannot be empty" });
    }
    if (!(await BaseValidations.isValidInteger(petOwnerId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    const pets = await PetService.getPetsByPOId(Number(petOwnerId));
    res.status(200).json(pets);
  } catch (error) {
    next(error);
  }
};

exports.deletePet = async (req, res, next) => {
  try {
    const petId = req.params.id;
    if (!(await BaseValidations.isValidInteger(petId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }
    await PetService.deletePet(Number(petId));
    res.status(200).json("Pet successfully deleted");
  } catch (error) {
    next(error);
  }
};
