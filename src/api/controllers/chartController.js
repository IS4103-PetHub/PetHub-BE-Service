const BaseValidations = require("../validations/baseValidation");
const BusinessSalesService = require("../services/petBusinessSales/businessSalesService");
const constants = require("../../constants/common");
const reviewService = require("../services/serviceListing/reviewService");
const errorMessages = constants.errorMessages;

exports.getPetBusinessSalesData = async (req, res, next) => {
  try {
    const petBusinessId = req.params.id;
    if (!(await BaseValidations.isValidInteger(petBusinessId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    const petBusinessSalesData = await BusinessSalesService.getPetBusinessData(Number(petBusinessId));
    res.status(200).json(petBusinessSalesData);
  } catch (error) {
    next(error);
  }
};

exports.getReviewsDataForServiceListing = async (req, res, next) => {
  try {
    const serviceListingId = req.params.id;
    const monthsBack = req.query.monthsBack;

    if (!(await BaseValidations.isValidInteger(serviceListingId))) {
      return res.status(400).json({ message: errorMessages.INVALID_ID });
    }

    if (!(await BaseValidations.isValidInteger(monthsBack)) || Number(monthsBack) > 12) {
      return res
        .status(400)
        .json({ message: "`monthsBack` must be a valid integer between 0 and 12 inclusive." });
    }

    const averageReviewData = await reviewService.generateAverageReviewData(
      Number(serviceListingId),
      monthsBack
    );
    const ratingCountDistributionData = await reviewService.generateRatingCountDistributionData(
      Number(serviceListingId),
      monthsBack
    );
    const ratingCountData = await reviewService.generateRatingCountData(Number(serviceListingId), monthsBack);

    const reviewsData = {
      averageReviewData,
      ratingCountDistributionData,
      ratingCountData,
    };

    res.status(200).json(reviewsData);
  } catch (error) {
    next(error);
  }
};
