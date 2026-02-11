const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getAllLeaves,
  updateLeaveStatus,
  getMyLeaves,
} = require("../controllers/leaveController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// Employee
router.post("/", protect, applyLeave);
router.get("/my", protect, getMyLeaves);

// Admin
router.get("/", protect, isAdmin, getAllLeaves);
router.put("/:id", protect, isAdmin, updateLeaveStatus);

module.exports = router;