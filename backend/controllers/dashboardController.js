const User = require("../models/User");
const Shift = require("../models/Shift");
const Schedule = require("../models/Schedule");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: "employee" });
    const totalShifts = await Shift.countDocuments();
    const totalSchedules = await Schedule.countDocuments();

    res.status(200).json({
      totalEmployees,
      totalShifts,
      totalSchedules
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};