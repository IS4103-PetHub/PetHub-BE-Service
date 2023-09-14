const { BusinessType, BusinessApplicationStatus } = require("@prisma/client");

exports.isValidBusinessType = (strData) => {
  return Object.values(BusinessType).includes(strData);
};

exports.isValidApplicationStatus = (strData) => {
  return Object.values(BusinessApplicationStatus).includes(strData);
};

// Put in its own address module if have time
exports.validAddressFieldsPresent = async (addresses) => {
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
