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
      case !(await PetBusinessApplicationValidations.mandatoryFieldsCheck(
        mandatoryFields,
        data
      )):
        errorMessage = `One of these fields are missing: ${mandatoryFields}`;
        break;
      case !(await PetBusinessApplicationValidations.validAddressFieldsPresent(
        data.businessAddresses
      )):
        errorMessage = "Invalid address format";
        break;
      case !(await BaseValidations.isValidNumber(data.petBusinessId)):
        errorMessage = "Invalid ID format";
        break;
      case !(await PetBusinessApplicationValidations.isValidBusinessType(
        data.businessType
      )):
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

    const petBusinessApplication = await PetBusinessApplicationService.register(
      data
    );
    res.status(201).json(petBusinessApplication);
  } catch (error) {
    next(error);
  }
};
