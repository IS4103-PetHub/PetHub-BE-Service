const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// payment endpoint health check
router.get("/health-check", async (req, res, next) => {
  res.send({ message: "Ok payment api is working 🚀" });
});

router.post("/checkout", paymentController.checkout);
router.post("/refund", paymentController.refund)

module.exports = router;
