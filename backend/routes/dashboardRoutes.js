const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

const {
  getDashboardStats,
  getEmployeeDashboard
} = require("../controllers/dashboardController");

// ✅ Admin dashboard stats (admin-only)
router.get("/stats", protect, isAdmin, getDashboardStats);

// ✅ Employee personal dashboard
router.get("/me", protect, getEmployeeDashboard);

module.exports = router;