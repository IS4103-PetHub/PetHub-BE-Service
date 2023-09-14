const express = require("express");
const router = express.Router();
const petBusinessApplicationController = require("../controllers/petBusinessApplicationController");

router.get("/health-check", async (req, res, next) => {
  res.send({ message: "Ok PB application API is working 🚀" });
});

router.post("/", petBusinessApplicationController.register);
router.put("/:id", petBusinessApplicationController.updatePetBusinessApplication);
router.get("/", petBusinessApplicationController.getAllPetBusinessApplications); // accepts a query param for "status"
router.get("/:id", petBusinessApplicationController.getPetBusinessApplicationById);
router.get("/status/:id", petBusinessApplicationController.getPetBusinessApplicationStatusByPBId);
router.post("/approve/:id", petBusinessApplicationController.approvePetBusinessApplication);
router.post("/reject/:id", petBusinessApplicationController.rejectPetBusinessApplication);
// router.delete("/pet-business-id/:id", petBusinessApplicationController.deletePetBusinessApplicationByPBId); // for testing purposes

module.exports = router;
