const express = require("express");
const router = express.Router();
const petController = require("../controllers/petController");
const multer = require("multer")

// health check
router.get("/health-check", async (req, res, next) => {
    res.send({ message: "Ok pet api is working 🚀" });
  });

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

// CREATE AND UPDATE
// As file upload is required, these 2 APIs use form-data instead of JSON
router.post("", upload.array('file'), petController.createPet);
router.patch("/:id", upload.array('file'), petController.updatePet);

router.get("", petController.getAllPets);
router.get("/pet-owners/:id?", petController.getPetsByPOId);
router.get("/:id", petController.getPetById);
router.delete("/:id", petController.deletePet);

module.exports = router;
