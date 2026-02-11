const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getDashboardStats,
  getEmployeeDashboard
} = require("../controllers/dashboardController");

// 🔹 Admin dashboard stats
router.get("/stats", protect, getDashboardStats);

// 🔹 Employee personal dashboard
router.get("/me", protect, getEmployeeDashboard);

module.exports = router;