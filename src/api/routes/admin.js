const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// admin endpoint health check
router.get("/", async (req, res, next) => {
  res.send({ message: "Ok admin api is working 🚀" });
});

router.post("/tag", adminController.createTag);
router.put("/tag/:id", adminController.updateTag);
router.get("/tag/all", adminController.getAllTags);
router.get("/tag/:id", adminController.getTagById);
router.delete("/tag/:id", adminController.deleteTag);

module.exports = router;
