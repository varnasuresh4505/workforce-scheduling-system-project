const express = require("express");
const router = express.Router();

const {
  createSchedule,
  getSchedules,
  getMySchedules,
} = require("../controllers/scheduleController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

router.post("/", protect, isAdmin, createSchedule);
router.get("/", protect, isAdmin, getSchedules);

// optional employee route
router.get("/my", protect, getMySchedules);

module.exports = router;