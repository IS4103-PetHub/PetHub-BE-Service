const BaseValidations = require("../validations/baseValidation");
const PetBusinessApplicationValidations = require("../validations/petBusinessApplicationValidation");
const UserValidations = require("../validations/userValidation");
const PetBusinessApplicationService = require("../services/petBusinessApplicationService");

exports.register = async (req, res, next) => {
  try {
    const mandatoryFields = [
      "businessEmail",
      "businessDescription",
      "websiteURL",
      "petBusinessId",
      "businessType",
    ];

    const data = req.body;
    let errorMessage;

    /*
        Not validated for now: attachments
    */
    switch (true) {
      case !(await PetBusinessApplicationValidations.mandatoryFieldsCheck(mandatoryFields, data)):
        errorMessage = `One of these fields are missing: ${mandatoryFields}`;
        break;
      case !(await PetBusinessApplicationValidations.validAddressFieldsPresent(data.businessAddresses)):
        errorMessage = "Invalid address format";
        break;
      case !(await BaseValidations.isValidNumber(data.petBusinessId)):
        errorMessage = "Invalid ID format";
        break;
      case !(await PetBusinessApplicationValidations.isValidBusinessType(data.businessType)):
        errorMessage = "Invalid BusinessType";
        break;
      case !(await UserValidations.isValidEmail(data.businessEmail)):
        errorMessage = "Invalid email address";
        break;
      case !(await UserValidations.isValidURL(data.websiteURL)):
        errorMessage = "Invalid website URL";
        break;
      default:
        break;
    }

    // Error with request payload, bad format (400)
    if (errorMessage) {
      return res.status(400).json({ errorMessage });
    }

    const petBusinessApplication = await PetBusinessApplicationService.register(data);
    res.status(201).json(petBusinessApplication);
  } catch (error) {
    next(error);
  }
};

exports.getAllPetBusinessApplications = async (req, res, next) => {
  try {
    const petBusinessApplications = await PetBusinessApplicationService.getAllPetBusinessApplications();
    res.status(200).json(petBusinessApplications);
  } catch (error) {
    next(error);
  }
};

exports.getPetBusinessApplicationById = async (req, res, next) => {
  try {
    const petBusinessApplicationId = req.params.id;
    if (!(await BaseValidations.isValidNumber(petBusinessApplicationId))) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const petBusinessApplication = await PetBusinessApplicationService.getPetBusinessApplicationById(
      Number(petBusinessApplicationId)
    );
    res.status(200).json(petBusinessApplication);
  } catch (error) {
    next(error);
  }
};

exports.getPetBusinessApplicationByStatus = async (req, res, next) => {
  try {
    const status = req.params.status;
    if (!status || !(await PetBusinessApplicationValidations.isValidApplicationStatus(status))) {
      return res.status(400).json({ message: "Invalid status { 'PENDING', 'APPROVED', 'REJECTED' }" });
    }
    const petBusinessApplication = await PetBusinessApplicationService.getPetBusinessApplicationByStatus(
      status
    );
    res.status(200).json(petBusinessApplication);
  } catch (error) {
    next(error);
  }
};

exports.getPetBusinessApplicationByPBId = async (req, res, next) => {
  try {
    const petBusinessId = req.params.id;
    if (!petBusinessId) {
      return res.status(400).json({ message: "Pet Business ID cannot be empty" });
    }
    if (!(await BaseValidations.isValidNumber(petBusinessId))) {
      return res.status(400).json({ message: "Invalid ID Format" });
    }
    const petBusinessApplication = await PetBusinessApplicationService.getPetBusinessApplicationByPBId(
      Number(petBusinessId)
    );
    res.status(200).json(petBusinessApplication);
  } catch (error) {
    next(error);
  }
};
