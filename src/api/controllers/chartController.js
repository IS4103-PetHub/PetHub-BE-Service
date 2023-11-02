const BaseValidations = require("../validations/baseValidation");
const BusinessSalesService = require("../services/petBusinessSales/businessSalesService");
const AdminDashboardService = require("../services/dashboard/adminDashboardService")
const constants = require("../../constants/common");
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

exports.getAdminDashboardData = async (req, res, next) => {
  try {
    const adminDashboardData = await AdminDashboardService.getAdminDashboardData();
    res.status(200).json(adminDashboardData)
  } catch (error) {
    next(error)
  }
}
