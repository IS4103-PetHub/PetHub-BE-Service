const ServiceListingService = require("../services/serviceListing/baseServiceListing");
const BaseValidations = require("../validations/baseValidation");
const ServiceListingValidations = require("../validations/servicelistingValidation");
const constants = require("../../constants/common");
const limitations = constants.limitations;
const errorMessages = constants.errorMessages;
const {
  uploadImgFiles,
  getObjectSignedUrl,
} = require("../services/s3Service.js");

exports.createServiceListing = async (req, res, next) => {
  try {
    const data = req.body;
    if (
      !data.title ||
      !data.petBusinessId ||
      !data.basePrice ||
      !data.category ||
      !data.description
    ) {
      return res.status(400).json({
        message: "Incomplete form data. Please fill in all required fields.",
      });
    }

    if (
      !(await BaseValidations.isValidLength(
        data.title,
        limitations.SERVICE_LISTING_TITLE_LENGTH
      ))
    ) {
      return res.status(400).json({
        message: errorMessages.INVALID_SERVICE_TITLE,
      });
    }
    if (!(await BaseValidations.isValidNumber(data.petBusinessId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }
    if (!(await BaseValidations.isValidNumber(data.basePrice))) {
      return res
        .status(400)
        .json({ message: errorMessages.INVALID_BASE_PRICE });
    }
    if (!(await ServiceListingValidations.isValidCategory(data.category))) {
      return res.status(400).json({ message: errorMessages.INVALID_CATEGORY });
    }
    if (data.tagIds) {
      if (!(await BaseValidations.isValidNumericIDs(data.tagIds))) {
        return res
          .status(400)
          .json({ message: "Please ensure that every tag ID is valid" });
      }
    }
    if (data.addressIds) {
      if (!(await BaseValidations.isValidNumericIDs(data.addressIds))) {
        return res
          .status(400)
          .json({ message: "Please ensure that every address ID is valid" });
      }
    }
    if (req.files) {
      data.attachmentKeys = await uploadImgFiles(req.files);
      data.attachmentURLs = await getObjectSignedUrl(data.attachmentKeys);
    }
    const serviceListing = await ServiceListingService.createServiceListing(
      data
    );
    res.status(201).json(serviceListing);
  } catch (error) {
    next(error);
  }
};

exports.updateServiceListing = async (req, res, next) => {
  try {
    const updateData = req.body;
    const serviceListingId = req.params.id;
    if (!(await BaseValidations.isValidNumber(serviceListingId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }
    if (
      updateData.title &&
      !(await BaseValidations.isValidLength(
        updateData.title,
        limitations.SERVICE_LISTING_TITLE_LENGTH
      ))
    ) {
      return res.status(400).json({
        message: errorMessages.INVALID_SERVICE_TITLE,
      });
    }
    if (
      updateData.basePrice &&
      !(await BaseValidations.isValidNumber(updateData.basePrice))
    ) {
      return res
        .status(400)
        .json({ message: errorMessages.INVALID_BASE_PRICE });
    }
    if (
      updateData.category &&
      !(await ServiceListingValidations.isValidCategory(updateData.category))
    ) {
      return res.status(400).json({ message: errorMessages.INVALID_CATEGORY });
    }
    if (
      updateData.tagIds &&
      !(await BaseValidations.isValidNumericIDs(updateData.tagIds))
    ) {
      return res
        .status(400)
        .json({ message: "Please ensure that every tag ID is valid" });
    }

    if (req.files) {
      // delete existing files and update with new files
      await ServiceListingService.deleteFilesOfAServiceListing(
        Number(serviceListingId)
      );
      updateData.attachmentKeys = await uploadImgFiles(req.files);
      updateData.attachmentURLs = await getObjectSignedUrl(
        updateData.attachmentKeys
      );
    }
    updatedListing = await ServiceListingService.updateServiceListing(
      Number(serviceListingId),
      updateData
    );

    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

exports.getAllServiceListing = async (req, res, next) => {
  try {
    const serviceListings = await ServiceListingService.getAllServiceListings();
    res.status(200).json(serviceListings);
  } catch (error) {
    next(error);
  }
};

exports.getServiceListingById = async (req, res, next) => {
  try {
    const serviceListingId = req.params.id;
    if (!(await BaseValidations.isValidNumber(serviceListingId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    const serviceListing = await ServiceListingService.getServiceListingById(
      Number(serviceListingId)
    );
    res.status(200).json(serviceListing);
  } catch (error) {
    next(error);
  }
};

exports.getServiceListingByCategory = async (req, res, next) => {
  try {
    const category = req.params.category;
    if (!category) {
      return res.status(400).json({ message: errorMessages.EMPTY_CATEGORY });
    }
    if (!(await ServiceListingValidations.isValidCategory(category))) {
      return res.status(400).json({ message: errorMessages.INVALID_CATEGORY });
    }

    const serviceListings =
      await ServiceListingService.getServiceListingByCategory(category);
    res.status(200).json(serviceListings);
  } catch (error) {
    next(error);
  }
};

exports.getServiceListingByTag = async (req, res, next) => {
  try {
    const tagId = req.params.tagId;
    if (!tagId) {
      return res.status(400).json({ message: "Tag ID cannot be empty" });
    }
    if (!(await BaseValidations.isValidNumber(tagId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    const serviceListings = await ServiceListingService.getServiceListingByTag(
      Number(tagId)
    );
    res.status(200).json(serviceListings);
  } catch (error) {
    next(error);
  }
};

exports.getServiceListingByPBId = async (req, res, next) => {
  try {
    const petBusinessId = req.params.id;
    if (!petBusinessId) {
      return res
        .status(400)
        .json({ message: "Pet Business ID cannot be empty" });
    }
    if (!(await BaseValidations.isValidNumber(petBusinessId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    const serviceListings = await ServiceListingService.getServiceListingByPBId(
      Number(petBusinessId)
    );
    res.status(200).json(serviceListings);
  } catch (error) {
    next(error);
  }
};

exports.deleteServiceListing = async (req, res, next) => {
  try {
    const serviceListingId = req.params.id;
    if (!serviceListingId) {
      return res
        .status(400)
        .json({ message: "Service Listing ID cannot be empty" });
    }
    if (!(await BaseValidations.isValidNumber(serviceListingId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    await ServiceListingService.deleteServiceListing(Number(serviceListingId));
    res.status(200).json({ message: "Service listing deleted successfully" });
  } catch (error) {
    next(error);
  }
};
