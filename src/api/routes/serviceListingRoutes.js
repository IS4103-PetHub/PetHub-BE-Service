const express = require("express");
const router = express.Router();
const serviceListingController = require("../controllers/serviceListingController");

// service listing endpoint health check
router.get("/health-check", async (req, res, next) => {
  res.send({ message: "Ok service lising api is working 🚀" });
});

// CREATE AND UPDATE
router.post("", serviceListingController.createServiceListing);
router.patch("/:id", serviceListingController.updateServiceListing);

// RETRIEVE ALL, BY ID, BY CATEGORY, BY TAG, BY PB ID
router.get("", serviceListingController.getAllServiceListing);
router.get("/category/:category?", serviceListingController.getServiceListingByCategory);
router.get("/tag/:tagId?", serviceListingController.getServiceListingByTag);
router.get("/pet-businesses/:id?", serviceListingController.getServiceListingByPBId);
router.get("/:id", serviceListingController.getServiceListingById);


// DELETE [Add logic to check for existing connections when order management is completed]
router.delete('/:id', serviceListingController.deleteServiceListing);

module.exports = router;
