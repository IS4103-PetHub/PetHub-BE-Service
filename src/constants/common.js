const limitations = {
  SERVICE_LISTING_TITLE_LENGTH: 64,
  TAG_LENGTH: 16,
};

const errorMessages = {
  INVALID_ID: "Invalid ID Format",
  INVALID_SERVICE_TITLE: `Title length should be <= ${limitations.SERVICE_LISTING_TITLE_LENGTH} and should not be empty`,
  INVALID_TAG: `Tag length should be <= ${limitations.TAG_LENGTH} characters and should not be empty`,
  INVALID_PET: `Pet name length should be <= ${limitations.TAG_LENGTH} characters and should not be empty`,

  INVALID_CATEGORY: `Please enter a valid category`,
  EMPTY_CATEGORY: "Category cannot be empty",

  INVALID_BASE_PRICE: `Please enter a valid base price`,
  INVALID_WEIGHT: `Please enter a valid weight`,

  INVALID_GENDER: `Please enter a valid gender`,
  EMPTY_GENDER: "Gender cannot be empty",

  INVALID_PET_TYPE: `Please enter a valid pet type`,
  EMPTY_PET_TYPE: "Pet type cannot be empty",

};

const DEFAULT_CR_ID = 1; // Default Commission Rule is Seeded to ID 1

module.exports = {
  limitations,
  errorMessages,
  DEFAULT_CR_ID
};
