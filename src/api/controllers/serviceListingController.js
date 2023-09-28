const ServiceListingService = require("../services/serviceListing/baseServiceListing");
const BaseValidations = require("../validations/baseValidation");
const ServiceListingValidations = require("../validations/servicelistingValidation");
const constants = require("../../constants/common");
const limitations = constants.limitations;
const errorMessages = constants.errorMessages;
const S3Service = require("../services/s3Service.js");
const s3Service = new S3Service();

exports.createServiceListing = async (req, res, next) => {
  try {
    const data = req.body;
    if (
      !data.title ||
      !data.petBusinessId ||
      !data.basePrice ||
      !data.category ||
      !data.description ||
      !data.calendarGroupId ||
      !data.duration
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

    if (!(await BaseValidations.isValidInteger(data.petBusinessId) ||
      !(await BaseValidations.isValidInteger(data.calendarGroupId)) ||
      !(await BaseValidations.isValidInteger(data.duration)))
    ) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }
    data.petBusinessId = parseInt(data.petBusinessId, 10);
    data.calendarGroupId = parseInt(data.calendarGroupId, 10);
    data.duration = parseInt(data.duration, 10);

    if (!(await BaseValidations.isValidFloat(data.basePrice))) {
      return res
        .status(400)
        .json({ message: errorMessages.INVALID_BASE_PRICE });
    }
    data.basePrice = parseFloat(data.basePrice);

    if (!(await ServiceListingValidations.isValidCategory(data.category))) {
      return res.status(400).json({ message: errorMessages.INVALID_CATEGORY });
    }

    if (data.tagIds) {
      if (!(await BaseValidations.isValidNumericIDs(data.tagIds))) {
        return res
          .status(400)
          .json({ message: "Please ensure that every tag ID is valid" });
      }
      data.tagIds = data.tagIds.map((id) => parseInt(id, 10));
    }

    if (data.addressIds) {
      if (!(await BaseValidations.isValidNumericIDs(data.addressIds))) {
        return res
          .status(400)
          .json({ message: "Please ensure that every address ID is valid" });
      }
      data.addressIds = data.addressIds.map((id) => parseInt(id, 10));
    }

    if (req.files) {
      data.attachmentKeys = await s3Service.uploadImgFiles(req.files);
      data.attachmentURLs = await s3Service.getObjectSignedUrl(
        data.attachmentKeys
      );
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
    let serviceListingId = req.params.id;
    if (!(await BaseValidations.isValidInteger(serviceListingId))||
    !(await BaseValidations.isValidInteger(updateData.calendarGroupId)) ||
    !(await BaseValidations.isValidInteger(updateData.duration))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }
    serviceListingId = parseInt(serviceListingId, 10);
    updateData.calendarGroupId = parseInt(updateData.calendarGroupId, 10);
    updateData.duration = parseInt(updateData.duration, 10);

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
      !(await BaseValidations.isValidFloat(updateData.basePrice))
    ) {
      return res
        .status(400)
        .json({ message: errorMessages.INVALID_BASE_PRICE });
    }
    updateData.basePrice = parseFloat(updateData.basePrice);

    if (
      updateData.category &&
      !(await ServiceListingValidations.isValidCategory(updateData.category))
    ) {
      return res.status(400).json({ message: errorMessages.INVALID_CATEGORY });
    }

    if (updateData.tagIds) {
      if (!(await BaseValidations.isValidNumericIDs(updateData.tagIds))) {
        return res
          .status(400)
          .json({ message: "Please ensure that every tag ID is valid" });
      }
      updateData.tagIds = updateData.tagIds.map((id) => parseInt(id, 10));
    }

    if (updateData.addressIds) {
      if (!(await BaseValidations.isValidNumericIDs(updateData.addressIds))) {
        return res
          .status(400)
          .json({ message: "Please ensure that every address ID is valid" });
      }
      updateData.addressIds = updateData.addressIds.map((id) => parseInt(id, 10));
    }

    if (req.files) {
      // delete existing files and update with new files
      await ServiceListingService.deleteFilesOfAServiceListing(
        serviceListingId
      );
      updateData.attachmentKeys = await s3Service.uploadImgFiles(req.files);
      updateData.attachmentURLs = await s3Service.getObjectSignedUrl(
        updateData.attachmentKeys
      );
    }
    updatedListing = await ServiceListingService.updateServiceListing(
      serviceListingId,
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
    if (!(await BaseValidations.isValidInteger(serviceListingId))) {
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
    if (!(await BaseValidations.isValidInteger(tagId))) {
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
    if (!(await BaseValidations.isValidInteger(petBusinessId))) {
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
    if (!(await BaseValidations.isValidInteger(serviceListingId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    await ServiceListingService.deleteServiceListing(Number(serviceListingId));
    res.status(200).json({ message: "Service listing deleted successfully" });
  } catch (error) {
    next(error);
  }
};
