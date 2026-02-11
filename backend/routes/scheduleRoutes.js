const express = require("express");
const router = express.Router();

const {
  assignShift,
  getSchedules
} = require("../controllers/scheduleController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// Admin only
router.post("/", protect, isAdmin, assignShift);
router.get("/", protect, isAdmin, getSchedules);

module.exports = router;