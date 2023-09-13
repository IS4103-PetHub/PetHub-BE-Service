const express = require("express");
const router = express.Router();
const petBusinessApplicationController = require("../controllers/petBusinessApplicationController");

router.get("/health-check", async (req, res, next) => {
  res.send({ message: "Ok PB application API is working 🚀" });
});

router.post("/register", petBusinessApplicationController.register);
// router.patch(
//   "/update/:applicationId",
//   petBusinessApplicationController.updateApplication
// );
// router.get("/:status", petBusinessApplicationController.getApplicationByStatus);
// router.get("/", petBusinessApplicationController.getAllApplications);
// router.get("/:id", petBusinessApplicationController.getApplicationById);
// router.get("/status/:id", petBusinessApplicationController.getStatusByPBId);
// // Remember to do the email for PH-56 for the below
// router.get("/reject/:id", petBusinessApplicationController.rejectApplication);
// router.get("/approve/:id", petBusinessApplicationController.approveApplication);

module.exports = router;
