const limitations = {
  SERVICE_LISTING_TITLE_LENGTH: 64,
  TAG_LENGTH: 16,
};

const errorMessages = {
  INVALID_ID: "Invalid ID Format",
  INVALID_SERVICE_TITLE: `Title length should be between ${limitations.SERVICE_LISTING_TITLE_LENGTH} and should not be empty`,
  INVALID_TAG: `Tag length should be <= ${limitations.TAG_LENGTH} characters and should not be empty`,

  INVALID_CATEGORY: `Please enter a valid category`,
  EMPTY_CATEGORY: "Category cannot be empty",

  INVALID_BASE_PRICE: `Please enter a valid base price`,
};

module.exports = { limitations, errorMessages };
