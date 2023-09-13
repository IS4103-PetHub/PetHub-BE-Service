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
const rbacRoutes = require("./rbacRoutes");
const authRoutes = require("./auth");
const petBusinessApplicationRoutes = require("./petBusinessApplicationRoutes");

// Use route modules
router.use("/users", userRoutes);
router.use("/service-listings", serviceListingRoutes);
router.use("/tags", tagRoutes);
router.use("/rbac", rbacRoutes);
router.use("/", authRoutes);
router.use("/pbapplication", petBusinessApplicationRoutes);

module.exports = router;
