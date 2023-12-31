const express = require("express");
const router = express.Router();
const serviceListingController = require("../controllers/serviceListingController");
const multer = require("multer")

// service listing endpoint health check
router.get("/health-check", async (req, res, next) => {
  res.send({ message: "Ok service lising api is working 🚀" });
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// CREATE AND UPDATE
// As file upload is required, these 2 APIs use form-data instead of JSON
router.post("", upload.array('file'), serviceListingController.createServiceListing);
router.patch("/:id", upload.array('file'), serviceListingController.updateServiceListing);

// RETRIEVE ALL, BY ID, BY CATEGORY, BY TAG, BY PB ID
router.get("", serviceListingController.getAllServiceListing);
router.get("/active", serviceListingController.getAllServiceListingsAvailableForPetOwners);
router.get("/category/:category?", serviceListingController.getServiceListingByCategory);
router.get("/tag/:tagId?", serviceListingController.getServiceListingByTag);
router.get("/pet-businesses/:id?", serviceListingController.getServiceListingByPBId);
router.get("/get-featured-listings", serviceListingController.getFeaturedListings);
router.get("/get-recommended-listings/:id", serviceListingController.getRecommendedListings);
router.get("/get-bumped-listings", serviceListingController.getBumpedListings);
router.get("/:id", serviceListingController.getServiceListingById);

// DELETE [Add logic to check for existing connections when order management is completed]
router.delete('/:id', serviceListingController.deleteServiceListing);

// Bump Service Listing 
router.patch("/:id/bump", serviceListingController.bumpServiceListing);

module.exports = router;
