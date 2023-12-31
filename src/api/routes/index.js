const express = require("express");
const router = express.Router();

// API endpoint health check
router.get("/", async (req, res, next) => {
  res.send({ message: "Ok api is working 🚀" });
});

// Import route modules
const userRoutes = require("./userRoutes");
const serviceListingRoutes = require("./serviceListingRoutes");
const tagRoutes = require("./tagRoutes");
const petRoutes = require("./petRoutes");
const rbacRoutes = require("./rbacRoutes");
const authRoutes = require("./auth");
const petBusinessApplicationRoutes = require("./petBusinessApplicationRoutes");
const calendarGroupRoutes = require('./calendarGroupRoutes')
const bookingRoutes = require('./bookingRoutes')
const petLostAndFoundRoutes = require('./petLostAndFoundRoutes')
const commissionRuleRoutes = require('./commissionRulesRoutes')
const paymentRoutes = require('./paymentRoutes')
const orderItemRoutes = require('./orderItemRoutes')
const articleRoutes = require('./articleRoutes')
const reviewRoutes = require('./reviewRoutes')
const chartRoutes = require('./chartRoutes')
const refundRequest = require('./refundRequestRoutes')
const supportRoutes = require('./supportRoutes')
const payoutInvoice = require('./payoutInvoiceRoutes')

// Use route modules
router.use("/users", userRoutes);
router.use("/service-listings", serviceListingRoutes);
router.use("/tags", tagRoutes);
router.use("/pets", petRoutes);
router.use("/rbac", rbacRoutes);
router.use("/", authRoutes);
router.use("/pb-applications", petBusinessApplicationRoutes);
router.use("/calendar-groups", calendarGroupRoutes);
router.use("/bookings", bookingRoutes);
router.use("/lost-and-found", petLostAndFoundRoutes)
router.use("/payments", paymentRoutes);
router.use("/commission-rules", commissionRuleRoutes);
router.use("/order-items", orderItemRoutes);
router.use("/articles", articleRoutes);
router.use("/reviews", reviewRoutes);
router.use("/chart", chartRoutes);
router.use("/refund-requests", refundRequest);
router.use("/support-tickets", supportRoutes);
router.use("/payout-invoice", payoutInvoice)

module.exports = router;
