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
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
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
    shifts.forEach((s) => {
      totalMinutes += toMinutes(s.endTime) - toMinutes(s.startTime);
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