const petOwnerService = require("../services/user/petOwnerService");
const BaseValidations = require("../validations/baseValidation");
const constants = require("../../constants/common");
const errorMessages = constants.errorMessages;

exports.addToFavourites = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const serviceListingId = req.body.serviceListingId;
    if (!(await BaseValidations.isValidInteger(userId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }
    if (!(await BaseValidations.isValidInteger(serviceListingId))) {
        return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    const petOwner = await petOwnerService.addFavouriteListing(Number(userId), Number(serviceListingId));
    res.status(200).json(petOwner);
  } catch (error) {
    next(error);
  }
};

exports.viewAllFavouriteListings = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (!(await BaseValidations.isValidInteger(userId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }
    const petOwner = await petOwnerService.viewAllFavouriteListings(Number(userId));
    res.status(200).json(petOwner.favouriteListings);
  } catch (error) {
    next(error);
  }
};

exports.removeFromFavourites = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const serviceListingId = req.body.serviceListingId;
    if (!(await BaseValidations.isValidInteger(userId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }
    if (!(await BaseValidations.isValidInteger(serviceListingId))) {
        return res.status(400).json({ message: errorMessages.INVALID_ID });
    }
    const petOwner = await petOwnerService.removeFromFavourites(Number(userId), Number(serviceListingId));
    res.status(200).json(petOwner);
  } catch (error) {
    next(error);
  }
};
