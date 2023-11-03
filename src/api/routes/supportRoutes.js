const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportController");
const multer = require("multer")

// service listing endpoint health check
router.get("/health-check", async (req, res, next) => {
    res.send({ message: "Ok support ticket api is working 🚀" });
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// CREATE AND UPDATE
// As file upload is required, these APIs use form-data instead of JSON
router.post("/pet-owner/:userId", upload.array('files'), supportController.createSupportTicket);
router.post("/pet-business/:userId", upload.array('files'), supportController.createSupportTicket);
router.post("/:supportTicketId/comments", upload.array('files'), supportController.addComment);

router.get("", supportController.getAllSupportTickets);
router.get("/:supportTicketId", supportController.getSupportTicketById)
router.get("/:userId/user", supportController.getSupportTicketByUserId)


module.exports = router;