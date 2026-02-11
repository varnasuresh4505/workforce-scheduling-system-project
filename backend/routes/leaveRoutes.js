const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getAllLeaves,
  updateLeaveStatus
} = require("../controllers/leaveController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// Employee applies leave
router.post("/", protect, applyLeave);

// Admin views all leave requests
router.get("/", protect, isAdmin, getAllLeaves);

// Admin approves/rejects leave
router.put("/:id", protect, isAdmin, updateLeaveStatus);

module.exports = router;