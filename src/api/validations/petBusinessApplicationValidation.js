const { BusinessType, BusinessApplicationStatus } = require("@prisma/client");

exports.isValidBusinessType = async (strData) => {
  switch (strData) {
    case BusinessType.FNB:
    case BusinessType.HEALTHCARE:
    case BusinessType.SERVICE:
      return true;
    default:
      return false;
  }
};

exports.isValidApplicationStatus = async (strData) => {
  switch (strData) {
    case BusinessApplicationStatus.APPROVED:
    case BusinessApplicationStatus.REJECTED:
    case BusinessApplicationStatus.PENDING:
      return true;
    default:
      return false;
  }
};

// Put in its own address module if have time
exports.validAddressFieldsPresent = async (addresses) => {
  // Define required fields for Address model
  const requiredAddressFields = ["addressName", "line1", "postalCode"];

  for (const address of addresses) {
    for (const field of requiredAddressFields) {
      if (address[field] === undefined) {
        return false;
      }
    }
  }
  return true;
};

exports.mandatoryFieldsCheck = async (mandatoryFields, data) => {
  return mandatoryFields.every((field) => field in data);
};
