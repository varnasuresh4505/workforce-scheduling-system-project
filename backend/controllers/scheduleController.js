const Schedule = require("../models/Schedule");

exports.assignShift = async (req, res) => {
  try {
    const { employee, date, shift } = req.body;

    const existing = await Schedule.findOne({ employee, date });
    if (existing) {
      return res.status(400).json({ message: "Shift already assigned" });
    }

    const schedule = await Schedule.create({
      employee,
      date,
      shift,
      assignedBy: req.user._id
    });

    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("employee", "name email role")
      .populate("assignedBy", "name");

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};