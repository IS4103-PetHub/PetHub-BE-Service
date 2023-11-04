const express = require("express");
const router = express.Router();
const chartController = require("../controllers/chartController");

// chart endpoint health check
router.get("/health-check", async (req, res, next) => {
  res.send({ message: "Ok chart api is working 🚀" });
});

router.get("/pet-business-sales/data/:id", chartController.getPetBusinessSalesData);
router.get("/reviews/data/:id", chartController.getReviewsDataForServiceListing);
router.get("/admin-dashboard", chartController.getAdminDashboardData)
router.get("/pet-business-dashboard/data/:id", chartController.getPBDashboardData)

module.exports = router;
