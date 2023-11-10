const express = require("express");
const router = express.Router();
const refundRequestController = require("../controllers/refundRequestController");

// payment endpoint health check
router.get("/health-check", async (req, res, next) => {
    res.send({ message: "Ok refund request api is working 🚀" });
});

router.post("/", refundRequestController.createRefundRequest)
router.delete("/:refundRequestId", refundRequestController.cancelRefundRequest)
router.patch("/reject/:refundRequestId", refundRequestController.rejectRefundRequest)
router.patch("/approve/:refundRequestId", refundRequestController.approveRefundRequest)
router.get("/:refundRequestId", refundRequestController.getRefundRequestById)
router.get('/pet-businesses/:petBusinessId', refundRequestController.getRefundRequestByPetBusinessId);

module.exports = router;
