// backend/controllers/dashboardController.js

const User = require("../models/User");
const Shift = require("../models/Shift");
const Schedule = require("../models/Schedule");

// ✅ Admin dashboard stats + latest schedules
exports.getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: "employee" });
    const totalShifts = await Shift.countDocuments();
    const totalSchedules = await Schedule.countDocuments();

    const latestSchedules = await Schedule.find()
      .populate("employee", "name email")
      .populate("assignedBy", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      totalEmployees,
      totalShifts,
      totalSchedules,
      latestSchedules,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Helper for employee weekly hours
const toMinutes = (t) => {
  if (!t) return 0;
  const parts = String(t).trim().split(":");
  const h = Number(parts[0] || 0);
  const m = Number(parts[1] || 0);
  return h * 60 + m;
};

// ✅ FIX: handle overnight shift (e.g., 21:00 -> 02:00)
const calcShiftMinutes = (startTime, endTime) => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  let diff = end - start;

  // ✅ If shift crosses midnight, add 24 hours
  if (diff < 0) diff += 24 * 60;

  return diff;
};

const startOfWeek = (d) => {
  const date = new Date(d);
  const day = date.getDay(); // 0 sun
  const diff = (day === 0 ? -6 : 1) - day; // monday start
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

// ✅ Employee dashboard: details + weekly hours
exports.getEmployeeDashboard = async (req, res) => {
  try {
    const user = req.user;

    const weekStart = startOfWeek(new Date());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const shifts = await Shift.find({
      employee: user._id,
      date: { $gte: weekStart, $lte: weekEnd },
    });

    let totalMinutes = 0;

    // ✅ FIXED calculation
    shifts.forEach((s) => {
      totalMinutes += calcShiftMinutes(s.startTime, s.endTime);
    });

    const totalHours = Number(totalMinutes / 60).toFixed(2);

    return res.json({
      user,
      totalHours,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Admin: all employees + weekly hours
exports.getAllEmployeesWithHours = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" });

    // Get current week start
    const now = new Date();
    const weekStart = startOfWeek(now);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const result = [];

    for (let emp of employees) {
      const shifts = await Shift.find({
        employee: emp._id,
        date: { $gte: weekStart, $lte: weekEnd },
      });

      let totalMinutes = 0;

      // ✅ FIXED calculation
      shifts.forEach((shift) => {
        totalMinutes += calcShiftMinutes(shift.startTime, shift.endTime);
      });

      const totalHours = (totalMinutes / 60).toFixed(2);

      result.push({
        ...emp.toObject(),
        totalHours,
      });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};