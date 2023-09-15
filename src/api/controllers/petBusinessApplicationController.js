const BaseValidations = require("../validations/baseValidation");
const PetBusinessApplicationValidations = require("../validations/petBusinessApplicationValidation");
const UserValidations = require("../validations/userValidation");
const PetBusinessApplicationService = require("../services/petBusinessApplicationService");

exports.register = async (req, res, next) => {
  try {
    const data = req.body;
    let errorMessage;

    /*
        Not validated for now: attachments
    */
    switch (true) {
      case !(await PetBusinessApplicationValidations.mandatoryFieldsCheck(data)):
        errorMessage = `One of these fields are missing: ${PetBusinessApplicationValidations.mandatoryFields}`;
        break;
      case !(await PetBusinessApplicationValidations.validAddressFieldsPresent(data.businessAddresses)):
        errorMessage = "Invalid address format";
        break;
      case !(await BaseValidations.isValidNumber(data.petBusinessId)):
        errorMessage = "Invalid ID format";
        break;
      case !PetBusinessApplicationValidations.isValidBusinessType(data.businessType):
        errorMessage = "Invalid BusinessType";
        break;
      case !(await UserValidations.isValidEmail(data.businessEmail)):
        errorMessage = "Invalid email address";
        break;
      case !(data.websiteURL === "" || (await UserValidations.isValidURL(data.websiteURL))):
        errorMessage = "Invalid website URL";
        break;
      default:
        break;
    }

    // Error with request payload, bad format (400)
    if (errorMessage) {
      return res.status(400).json({ message: errorMessage });
    }

    const petBusinessApplication = await PetBusinessApplicationService.register(data);
    res.status(201).json(petBusinessApplication);
  } catch (error) {
    next(error);
  }
};

exports.updatePetBusinessApplication = async (req, res, next) => {
  try {
    const petBusinessApplicationId = req.params.id;
    if (!(await BaseValidations.isValidNumber(petBusinessApplicationId))) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const data = req.body;
    let errorMessage;

    /*
        Not validated for now: attachments
    */
    switch (true) {
      case !(await PetBusinessApplicationValidations.mandatoryFieldsCheck(data)):
        errorMessage = `One of these fields are missing: ${PetBusinessApplicationValidations.mandatoryFields}`;
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
      case !(data.websiteURL === "" || (await UserValidations.isValidURL(data.websiteURL))):
        errorMessage = "Invalid website URL";
        break;
      default:
        break;
    }
    // Error with request payload, bad format (400)
    if (errorMessage) {
      return res.status(400).json({ message: errorMessage });
    }
    const petBusinessApplication = await PetBusinessApplicationService.updatePetBusinessApplication(
      Number(petBusinessApplicationId),
      data
    );
    res.status(200).json(petBusinessApplication);
  } catch (error) {
    next(error);
  }
};

exports.getAllPetBusinessApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    console.log("STATUS2", status);

    let petBusinessApplications = [];
    if (status) {
      if (!PetBusinessApplicationValidations.isValidApplicationStatus(status)) {
        return res.status(400).json({ message: "Invalid status { 'PENDING', 'APPROVED', 'REJECTED' }" });
      }
      petBusinessApplications = await PetBusinessApplicationService.getPetBusinessApplicationByStatus(status);
    } else {
      petBusinessApplications = await PetBusinessApplicationService.getAllPetBusinessApplications();
    }
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

exports.getPetBusinessApplicationByPBId = async (req, res, next) => {
  try {
    const petBusinessId = req.params.id;
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

exports.getPetBusinessApplicationStatusByPBId = async (req, res, next) => {
  try {
    const petBusinessId = req.params.id;
    if (!(await BaseValidations.isValidNumber(petBusinessId))) {
      return res.status(400).json({ message: "Invalid ID Format" });
    }
    const petBusinessApplicationStatus =
      await PetBusinessApplicationService.getPetBusinessApplicationStatusByPBId(Number(petBusinessId));
    res.status(200).json({ status: 200, message: petBusinessApplicationStatus });
  } catch (error) {
    next(error);
  }
};

exports.approvePetBusinessApplication = async (req, res, next) => {
  try {
    const petBusinessApplicationId = req.params.id;
    const approverId = req.body.approverId;
    if (
      !(await BaseValidations.isValidNumber(petBusinessApplicationId)) ||
      !(await BaseValidations.isValidNumber(approverId))
    ) {
      return res.status(400).json({ message: "Invalid ID Format" });
    }
    const petBusinessApplication = await PetBusinessApplicationService.approvePetBusinessApplication(
      Number(petBusinessApplicationId),
      approverId
    );
    res.status(200).json(petBusinessApplication); // Can either return full obj or just a message, but former is chosen
  } catch (error) {
    next(error);
  }
};

exports.rejectPetBusinessApplication = async (req, res, next) => {
  try {
    const petBusinessApplicationId = req.params.id;
    if (!(await BaseValidations.isValidNumber(petBusinessApplicationId))) {
      return res.status(400).json({ message: "Invalid ID Format" });
    }
    const petBusinessApplication = await PetBusinessApplicationService.rejectPetBusinessApplication(
      Number(petBusinessApplicationId),
      req.body.remark
    );
    res.status(200).json(petBusinessApplication); // Can either return full obj or just a message, but former is chosen
  } catch (error) {
    next(error);
  }
};

// This function is just for testing purposes
exports.deletePetBusinessApplicationByPBId = async (req, res, next) => {
  try {
    const petBusinessId = req.params.id;
    if (!(await BaseValidations.isValidNumber(petBusinessId))) {
      return res.status(400).json({ message: "Invalid ID Format" });
    }
    await PetBusinessApplicationService.deletePetBusinessApplicationByPBId(
      Number(petBusinessId),
      req.body.remark
    );
    res.status(200).json({ message: "Deletion successful" });
  } catch (error) {
    next(error);
  }
};
