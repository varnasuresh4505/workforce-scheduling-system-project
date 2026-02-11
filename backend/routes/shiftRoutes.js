const express = require("express");
const router = express.Router();

const { createShift, getShifts } = require("../controllers/shiftController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

router.post("/", protect, isAdmin, createShift);
router.get("/", protect, isAdmin, getShifts);

module.exports = router;