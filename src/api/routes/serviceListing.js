const express = require("express");
const router = express.Router();
const serviceListingController = require("../controllers/serviceListingController");

// service listing endpoint health check
router.get("/", async (req, res, next) => {
  res.send({ message: "Ok service lising api is working 🚀" });
});

// CREATE AND UPDATE
router.post("/", serviceListingController.createServiceListing);
router.put("/:id", serviceListingController.updateServiceListing);

// RETRIEVE ALL, BY ID, BY CATEGORY, BY TAG, BY PB ID
router.get("/all", serviceListingController.getAllServiceListing);
router.get("/category/:category?", serviceListingController.getServiceListingByCategory);
router.get("/tag/:tagId?", serviceListingController.getServiceListingByTag);
router.get("/pet-business/:id?", serviceListingController.getServiceListingByPBId);
router.get("/:id", serviceListingController.getServiceListingById);


// DEACTIVATE
// router.put('/deactivate/:id', serviceListingController.deleteServiceListing);

module.exports = router;
