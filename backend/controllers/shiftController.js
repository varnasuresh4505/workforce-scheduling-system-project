const Shift = require("../models/Shift");

// ➕ Assign shift (Admin only)
exports.createShift = async (req, res) => {
  try {
    const { employeeId, date, startTime, endTime } = req.body;

    // ❗ Prevent overlapping shift
    const existingShift = await Shift.findOne({
      employee: employeeId,
      date,
      startTime
    });

    if (existingShift) {
      return res.status(400).json({
        message: "Shift already assigned for this time"
      });
    }

    const shift = await Shift.create({
      employee: employeeId,
      date,
      startTime,
      endTime
    });

    res.status(201).json(shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📋 Get all shifts
exports.getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find()
      .populate("employee", "name email")
      .sort({ date: 1 });

    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};