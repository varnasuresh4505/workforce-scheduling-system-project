const Shift = require("../models/Shift");
const Leave = require("../models/Leave");

// "HH:mm" -> minutes
const toMinutes = (t) => {
  const [h, m] = String(t).split(":").map(Number);
  return h * 60 + m;
};

// overlap helper
const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

// local midnight date from "YYYY-MM-DD"
const toLocalMidnight = (ymd) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};

exports.createShift = async (req, res) => {
  try {
    const { employeeId, date, startTime, endTime } = req.body;

    if (!employeeId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const start = toMinutes(startTime);
    let end = toMinutes(endTime);

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return res.status(400).json({ message: "Invalid time format" });
    }

    // ✅ support night shift (end next day)
    if (end <= start) end += 24 * 60;

    const shiftDate = toLocalMidnight(date);

    // ✅ BLOCK if approved leave overlaps this shift time
    const approvedLeaves = await Leave.find({
      employee: employeeId, // employeeId here is ObjectId (planner sends _id)
      status: "approved",
      fromDate: { $lte: shiftDate },
      toDate: { $gte: shiftDate },
    });

    const leaveConflict = approvedLeaves.some((lv) => {
      const ls = toMinutes(lv.startTime);
      let le = toMinutes(lv.endTime);

      // if leave time crosses midnight, support it
      if (le <= ls) le += 24 * 60;

      return overlaps(start, end, ls, le);
    });

    if (leaveConflict) {
      return res.status(400).json({
        message: "Cannot create shift: employee has an approved leave during this time",
      });
    }

    // ✅ Overlap check with existing shifts
    const existingShifts = await Shift.find({
      employee: employeeId,
      date: shiftDate,
    });

    const isOverlapping = existingShifts.some((s) => {
      const oldStart = toMinutes(s.startTime);
      let oldEnd = toMinutes(s.endTime);
      if (oldEnd <= oldStart) oldEnd += 24 * 60;
      return overlaps(start, end, oldStart, oldEnd);
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

exports.getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find()
      .populate("employee", "name email employeeId")
      .sort({ date: 1 });

    return res.json(shifts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};