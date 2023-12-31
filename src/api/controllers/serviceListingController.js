const ServiceListingService = require("../services/serviceListing/serviceListingService");
const BaseValidations = require("../validations/baseValidation");
const ServiceListingValidations = require("../validations/servicelistingValidation");
const constants = require("../../constants/common");
const limitations = constants.limitations;
const errorMessages = constants.errorMessages;
const s3ServiceInstance = require("../services/s3Service.js");
const { getUserFromToken } = require("../../utils/nextAuth");

exports.createServiceListing = async (req, res, next) => {
  try {
    const data = req.body;
    // Required fields
    if (
      !data.title ||
      !data.petBusinessId ||
      !data.basePrice ||
      !data.category ||
      !data.description ||
      !data.requiresBooking ||
      !data.defaultExpiryDays
    ) {
      return res.status(400).json({ message: "Incomplete form data. Please fill in all required fields." });
    }

    if (!(await BaseValidations.isValidLength(data.title, limitations.SERVICE_LISTING_TITLE_LENGTH))) {
      return res.status(400).json({ message: errorMessages.INVALID_SERVICE_TITLE });
    }

    if (!(await BaseValidations.isValidInteger(data.petBusinessId)) ||
      ((data.calendarGroupId) && !(await BaseValidations.isValidInteger(data.calendarGroupId))) ||
      ((data.duration) && !(await BaseValidations.isValidInteger(data.duration))) ||
      !(await BaseValidations.isValidInteger(data.defaultExpiryDays))) {
      return res.status(400).json({ message: errorMessages.INVALID_INTEGER });
    }
    data.petBusinessId = parseInt(data.petBusinessId, 10);
    data.calendarGroupId = parseInt(data.calendarGroupId, 10);
    data.duration = parseInt(data.duration, 10);
    data.defaultExpiryDays = parseInt(data.defaultExpiryDays, 10);

    if (!(await BaseValidations.isValidBooleanString(data.requiresBooking))) {
      return res.status(400).json({ message: "Requires Booking field should be `true` or `false`" });
    }
    data.requiresBooking = (data.requiresBooking === 'true') // convert to bool
    if (data.requiresBooking === true && !data.duration) {
      return res.status(400).json({ message: "If bookings are required, duration should not be null" });
    }

    if (!(await BaseValidations.isValidFloat(data.basePrice))) {
      return res.status(400).json({ message: errorMessages.INVALID_BASE_PRICE });
    }
    data.basePrice = parseFloat(data.basePrice);

    if (!(await ServiceListingValidations.isValidCategory(data.category))) {
      return res.status(400).json({ message: errorMessages.INVALID_CATEGORY });
    }

    // Ensure that the date is a valid and future date
    if (data.lastPossibleDate) {
      data.lastPossibleDate = new Date(data.lastPossibleDate);
      const currentDate = new Date();
      if (data.lastPossibleDate < currentDate) {
        return res.status(400).json({ message: errorMessages.INVALID_DATE });
      }
      data.lastPossibleDate = data.lastPossibleDate.toISOString()
    }

    if (data.tagIds) {
      if (!(await BaseValidations.isValidNumericIDs(data.tagIds))) {
        return res.status(400).json({ message: "Please ensure that every tag ID is valid" });
      }
      data.tagIds = data.tagIds.map((id) => parseInt(id, 10));
    }

    if (data.addressIds) {
      if (!(await BaseValidations.isValidNumericIDs(data.addressIds))) {
        return res.status(400).json({ message: "Please ensure that every address ID is valid" });
      }
      data.addressIds = data.addressIds.map((id) => parseInt(id, 10));
    }

    if (req.files) {
      data.attachmentKeys = await s3ServiceInstance.uploadImgFiles(req.files, "service-listing");
      data.attachmentURLs = await s3ServiceInstance.getObjectSignedUrl(data.attachmentKeys);
    }

    const serviceListing = await ServiceListingService.createServiceListing(data);
    res.status(201).json(serviceListing);
  } catch (error) {
    next(error);
  }
};

exports.updateServiceListing = async (req, res, next) => {
  try {
    const updateData = req.body;
    let serviceListingId = req.params.id;
    if (!(await BaseValidations.isValidInteger(serviceListingId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }
    serviceListingId = parseInt(serviceListingId, 10);

    if (updateData.title && !(await BaseValidations.isValidLength(updateData.title, limitations.SERVICE_LISTING_TITLE_LENGTH))
    ) {
      return res.status(400).json({ message: errorMessages.INVALID_SERVICE_TITLE });
    }

    if (updateData.basePrice && !(await BaseValidations.isValidFloat(updateData.basePrice))) {
      return res.status(400).json({ message: errorMessages.INVALID_BASE_PRICE });
    }
    updateData.basePrice = parseFloat(updateData.basePrice);

    if (updateData.category && !(await ServiceListingValidations.isValidCategory(updateData.category))) {
      return res.status(400).json({ message: errorMessages.INVALID_CATEGORY });
    }

    // Date function has in built validation for data.dataOfBirth user input
    if (updateData.lastPossibleDate) {
      updateData.lastPossibleDate = new Date(updateData.lastPossibleDate).toISOString();
    }


    if (updateData.calendarGroupId) {
      if (!(await BaseValidations.isValidInteger(updateData.calendarGroupId))) {
        return res.status(400).json({ message: errorMessages.INVALID_INTEGER });
      }
      updateData.calendarGroupId = parseInt(updateData.calendarGroupId, 10);
    }

    if (updateData.duration) {
      if (!(await BaseValidations.isValidInteger(updateData.duration))) {
        return res.status(400).json({ message: errorMessages.INVALID_INTEGER });
      }
      updateData.duration = parseInt(updateData.duration, 10);
    }

    if (updateData.requiresBooking) {
      if (!(await BaseValidations.isValidBooleanString(updateData.requiresBooking))) {
        return res.status(400).json({ message: "Requires Booking field should be `true` or `false`" });
      }
      updateData.requiresBooking = (updateData.requiresBooking === 'true') // convert to bool
      if (updateData.requiresBooking === true && !updateData.duration) {
        return res.status(400).json({ message: "If bookings are required, duration should not be null" });
      }
    }

    if (updateData.defaultExpiryDays) {
      if (!(await BaseValidations.isValidInteger(updateData.defaultExpiryDays))) {
        return res.status(400).json({ message: errorMessages.INVALID_INTEGER });
      }
      updateData.defaultExpiryDays = parseInt(updateData.defaultExpiryDays, 10);
    }

    // Ensure that the date is a valid and future date
    if (updateData.lastPossibleDate) {
      updateData.lastPossibleDate = new Date(updateData.lastPossibleDate);
      const currentDate = new Date();
      if (updateData.lastPossibleDate < currentDate) {
        return res.status(400).json({ message: errorMessages.INVALID_DATE });
      }
      updateData.lastPossibleDate = updateData.lastPossibleDate.toISOString()
    }

    if (updateData.tagIds) {
      if (!(await BaseValidations.isValidNumericIDs(updateData.tagIds))) {
        return res.status(400).json({ message: "Please ensure that every tag ID is valid" });
      }
      updateData.tagIds = updateData.tagIds.map((id) => parseInt(id, 10));
    }

    if (updateData.addressIds) {
      if (!(await BaseValidations.isValidNumericIDs(updateData.addressIds))) {
        return res.status(400).json({ message: "Please ensure that every address ID is valid" });
      }
      updateData.addressIds = updateData.addressIds.map((id) => parseInt(id, 10));
    }

    if (req.files) {
      // delete existing files and update with new files
      await ServiceListingService.deleteFilesOfAServiceListing(serviceListingId);
      updateData.attachmentKeys = await s3ServiceInstance.uploadImgFiles(req.files, "service-listing");
      updateData.attachmentURLs = await s3ServiceInstance.getObjectSignedUrl(updateData.attachmentKeys);
    }
    updatedListing = await ServiceListingService.updateServiceListing(serviceListingId, updateData);

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

exports.getAllServiceListingsAvailableForPetOwners = async (req, res, next) => {
  try {
    const categories = req.query.category ? Array.isArray(req.query.category) ? req.query.category : [req.query.category] : [];
    const tags = req.query.tag ? Array.isArray(req.query.tag) ? req.query.tag : [req.query.tag] : [];
    const limit = req.query.limit ? req.query.limit : null;

    const serviceListings = await ServiceListingService.getAllServiceListingsAvailableForPetOwners(categories, tags, limit);
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

    const serviceListings = await ServiceListingService.getServiceListingByCategory(category);
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
    const isPB = req.query.isPB;
    
    if (!(await BaseValidations.isValidInteger(petBusinessId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    const serviceListings = await ServiceListingService.getServiceListingByPBId(
      Number(petBusinessId),
      isPB
    );
    res.status(200).json(serviceListings);
  } catch (error) {
    next(error);
  }
};

exports.getRecommendedListings = async (req, res, next) => {
  try {
    const petOwnerId = req.params.id;
    if (!petOwnerId) {
      return res.status(400).json({ message: "Pet Owner ID cannot be empty" });
    }
    if (!(await BaseValidations.isValidInteger(petOwnerId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    const recommendedListings = await ServiceListingService.getRecommendedListings(Number(petOwnerId));
    res.status(200).json(recommendedListings);
  } catch (error) {
    next(error);
  }
};

exports.getFeaturedListings = async (req, res, next) => {
  try {
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;

    if (startDate) {
      startDate = new Date(startDate);
    }
    if (endDate) {
      endDate = new Date(endDate);
    }

    const featuredListings = await ServiceListingService.getOrCreateFeaturedListings(startDate, endDate);
    res.status(200).json(featuredListings);
  } catch (error) {
    next(error);
  }
};

exports.getBumpedListings = async (req, res, next) => {
  try {
    const bumpedListings = await ServiceListingService.getBumpedListings();
    res.status(200).json(bumpedListings);
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
    if (!req.headers['authorization']) {
      return res.status(404).json({ message: "Unauthorized: Token missing" });
    }

    const token = req.headers['authorization'].split(' ')[1];
    const callee = await getUserFromToken(token);
    if (!callee) {
      return res.status(400).json({ message: "Unable to find request caller!" });
    }

    await ServiceListingService.deleteServiceListing(Number(serviceListingId), callee);
    res.status(200).json({ message: "Service listing deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.bumpServiceListing = async (req, res, next) => {
  try {
    const serviceListingId = req.params.id;
    if (!(await BaseValidations.isValidInteger(serviceListingId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    const payload = req.body
    const validationResult = ServiceListingValidations.isValidBumpServiceListingPayload(payload);
    if (!validationResult.isValid) {
      res.status(400).send({ message: validationResult.message });
      return;
    }

    const newBump = await ServiceListingService.bumpServiceListing(Number(serviceListingId), payload);
    res.status(200).json(newBump);
  } catch (error) {
    next(error);
  }
};