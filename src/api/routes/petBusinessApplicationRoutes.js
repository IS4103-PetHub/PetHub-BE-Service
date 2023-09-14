const express = require("express");
const router = express.Router();
const petBusinessApplicationController = require("../controllers/petBusinessApplicationController");
const { getPetBusinessApplicationStatusByPBId } = require("../services/petBusinessApplicationService");

router.get("/health-check", async (req, res, next) => {
  res.send({ message: "Ok PB application API is working 🚀" });
});

router.post("/register", petBusinessApplicationController.register);
router.put("/update/:id", petBusinessApplicationController.updatePetBusinessApplication);
router.get("/", petBusinessApplicationController.getAllPetBusinessApplications);
router.get("/application-id/:id", petBusinessApplicationController.getPetBusinessApplicationById);
router.get("/filter-status/:status", petBusinessApplicationController.getPetBusinessApplicationByStatus);
router.get("/pet-business-id/:id", petBusinessApplicationController.getPetBusinessApplicationByPBId);
router.get(
  "/status/pet-business-id/:id",
  petBusinessApplicationController.getPetBusinessApplicationStatusByPBId
);

// // Remember to do the email for PH-56 for the below
// router.get("/reject/:id", petBusinessApplicationController.rejectApplication);
// router.get("/approve/:id", petBusinessApplicationController.approveApplication);

module.exports = router;
