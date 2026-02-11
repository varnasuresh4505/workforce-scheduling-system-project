const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// Logged-in users
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

// Admin-only
router.get("/admin", protect, isAdmin, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

module.exports = router;