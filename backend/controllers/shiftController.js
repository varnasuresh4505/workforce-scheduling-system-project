const Shift = require("../models/Shift");

// ✅ Helper: "HH:mm" -> minutes
const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// ✅ Create Shift with overlap check
exports.createShift = async (req, res) => {
  try {
    const { employeeId, date, startTime, endTime } = req.body;

    if (!employeeId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const start = toMinutes(startTime);
    const end = toMinutes(endTime);

    if (end <= start) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    const shiftDate = new Date(date);
    shiftDate.setHours(0, 0, 0, 0);

    const existingShifts = await Shift.find({
      employee: employeeId,
      date: shiftDate,
    });

    const isOverlapping = existingShifts.some((s) => {
      const oldStart = toMinutes(s.startTime);
      const oldEnd = toMinutes(s.endTime);
      return start < oldEnd && end > oldStart;
    });

    if (isOverlapping) {
      return res.status(400).json({
        message: "Shift time overlaps with an existing shift for this employee",
      });
    }

    const shift = await Shift.create({
      employee: employeeId,
      date: shiftDate,
      startTime,
      endTime,
    });

    return res.status(201).json(shift);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Get all shifts
exports.getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find()
      .populate("employee", "name email")
      .sort({ date: 1 });

    return res.json(shifts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};