const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

// payment endpoint health check
router.get("/health-check", async (req, res, next) => {
  res.send({ message: "Ok payout invoice api is working 🚀" });
});

router.get("/pet-businesses/:petBusinessId", transactionController.getPetBusinessPayoutInvoice);
router.get("/:payoutInvoiceId", transactionController.getPayoutInvoiceById)
module.exports = router;
