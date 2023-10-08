const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tagController");

// tag endpoint health check
router.get("/health-check", async (req, res, next) => {
  res.send({ message: "Ok tag api is working 🚀" });
});


router.post("", tagController.createTag);
router.get("", tagController.getAllTags);
router.get("/:id", tagController.getTagById);
router.patch("/:id", tagController.updateTag);
router.delete("/:id", tagController.deleteTag);

module.exports = router;
