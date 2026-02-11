const Schedule = require("../models/Schedule");
const Shift = require("../models/Shift");
const User = require("../models/User");

// helper: "HH:mm" -> minutes
const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// ✅ Admin creates schedule -> also creates Shift (planner updates)
exports.createSchedule = async (req, res) => {
  try {
    const { employeeId, date, fromTime, toTime } = req.body;

    if (!employeeId || !date || !fromTime || !toTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emp = await User.findOne({ employeeId, role: "employee" }).select("-password");
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    const start = toMinutes(fromTime);
    const end = toMinutes(toTime);
    if (end <= start) return res.status(400).json({ message: "Invalid time range" });

    const scheduleDate = new Date(date);
    scheduleDate.setHours(0, 0, 0, 0);

    // ✅ Schedule overlap check
    const existingSchedules = await Schedule.find({
      employee: emp._id,
      date: scheduleDate,
    });

    const scheduleOverlap = existingSchedules.some((s) => {
      const oldStart = toMinutes(s.fromTime);
      const oldEnd = toMinutes(s.toTime);
      return start < oldEnd && end > oldStart;
    });

    if (scheduleOverlap) {
      return res.status(400).json({ message: "Schedule overlaps with existing schedule" });
    }

    // ✅ Shift overlap check also (so planner remains safe)
    const existingShifts = await Shift.find({
      employee: emp._id,
      date: scheduleDate,
    });

    const shiftOverlap = existingShifts.some((s) => {
      const oldStart = toMinutes(s.startTime);
      const oldEnd = toMinutes(s.endTime);
      return start < oldEnd && end > oldStart;
    });

    if (shiftOverlap) {
      return res.status(400).json({ message: "Shift overlaps with existing shift" });
    }

    // ✅ Create schedule
    const schedule = await Schedule.create({
      employee: emp._id,
      employeeId: emp.employeeId,
      employeeName: emp.name,
      date: scheduleDate,
      fromTime,
      toTime,
      assignedBy: req.user._id,
    });

    // ✅ Auto-create shift (planner reads this)
    await Shift.create({
      employee: emp._id,
      date: scheduleDate,
      startTime: fromTime,
      endTime: toTime,
    });

    return res.status(201).json({
      message: "Schedule created and shift updated",
      schedule,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("assignedBy", "name")
      .sort({ date: 1 });

    return res.json(schedules);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Employee view own schedules (optional)
exports.getMySchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ employee: req.user._id })
      .populate("assignedBy", "name")
      .sort({ date: 1 });

    return res.json(schedules);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};