const express = require("express");
const router = express.Router();

const {
  addEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee
} = require("../controllers/employeeController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// Admin only
router.post("/", protect, isAdmin, addEmployee);
router.get("/", protect, isAdmin, getEmployees);
router.put("/:id", protect, isAdmin, updateEmployee);
router.delete("/:id", protect, isAdmin, deleteEmployee);

module.exports = router;