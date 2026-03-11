// controllers/scheduleController.js
const Schedule = require("../models/Schedule");
const Shift = require("../models/Shift");
const User = require("../models/User");
const Leave = require("../models/Leave");

// ✅ supports "09:00", "09:00 AM", "09:00am"
const toMinutes = (t) => {
  if (!t) return NaN;
  const s = String(t).trim().toLowerCase();

  // "hh:mm", optional "am/pm"
  const m = s.match(/^(\d{1,2}):(\d{2})(\s?(am|pm))?$/);
  if (!m) return NaN;

  let hh = Number(m[1]);
  const mm = Number(m[2]);
  const ap = m[4]; // "am" | "pm" | undefined

  if (ap) {
    if (hh === 12) hh = 0;
    if (ap === "pm") hh += 12;
  }

  return hh * 60 + mm;
};

const pad2 = (n) => String(n).padStart(2, "0");
const minutesToHHMM = (mins) => `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`;

// overlap check
const overlaps = (startA, endA, startB, endB) => startA < endB && endA > startB;

// local midnight date helper (prevents timezone shift issues)
const ymdToLocalMidnight = (ymd) => {
  const [y, m, d] = String(ymd).split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};

// ✅ Admin creates schedule -> also creates Shift
exports.createSchedule = async (req, res) => {
  try {
    const { employeeId, date, fromTime, toTime } = req.body;

    if (!employeeId || !date || !fromTime || !toTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emp = await User.findOne({ employeeId, role: "employee" }).select("-password");
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    let start = toMinutes(fromTime);
    let end = toMinutes(toTime);

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return res.status(400).json({ message: "Invalid time format. Use HH:MM or HH:MM AM/PM" });
    }

    // ✅ Night shift support: 21:00 -> 02:00 becomes 21:00 -> 26:00
    if (end <= start) end += 24 * 60;

    const scheduleDate = ymdToLocalMidnight(date);

    // ✅ 1) BLOCK if approved leave overlaps ANY part of requested time
    const approvedLeaves = await Leave.find({
      employee: emp._id,
      status: "approved",
      fromDate: { $lte: scheduleDate },
      toDate: { $gte: scheduleDate },
    });

    const hasLeaveOverlap = approvedLeaves.some((lv) => {
      let ls = toMinutes(lv.startTime);
      let le = toMinutes(lv.endTime);

      if (!Number.isFinite(ls) || !Number.isFinite(le)) return false;

      // ✅ Leave can also cross midnight
      if (le <= ls) le += 24 * 60;

      return overlaps(start, end, ls, le);
    });

    if (hasLeaveOverlap) {
      return res.status(400).json({
        message: "Cannot create schedule: employee has approved leave during this time",
      });
    }

    // ✅ 2) Schedule overlap check for same date
    const existingSchedules = await Schedule.find({
      employee: emp._id,
      date: scheduleDate,
    });

    const scheduleOverlap = existingSchedules.some((s) => {
      let oldStart = toMinutes(s.fromTime);
      let oldEnd = toMinutes(s.toTime);
      if (oldEnd <= oldStart) oldEnd += 24 * 60; // support stored night shifts

      return overlaps(start, end, oldStart, oldEnd);
    });

    if (scheduleOverlap) {
      return res.status(400).json({ message: "Schedule overlaps with existing schedule" });
    }

    // ✅ 3) Shift overlap check (planner safe)
    const existingShifts = await Shift.find({
      employee: emp._id,
      date: scheduleDate,
    });

    const shiftOverlap = existingShifts.some((sh) => {
      let oldStart = toMinutes(sh.startTime);
      let oldEnd = toMinutes(sh.endTime);
      if (oldEnd <= oldStart) oldEnd += 24 * 60;

      return overlaps(start, end, oldStart, oldEnd);
    });

    if (shiftOverlap) {
      return res.status(400).json({ message: "Shift overlaps with existing shift" });
    }

    // ✅ Normalize times back to HH:mm for storing
    const storeFrom = minutesToHHMM(start % (24 * 60));
    const storeTo = minutesToHHMM(end % (24 * 60)); // for night shift it'll look like "02:00"

    // ✅ Create schedule
    const schedule = await Schedule.create({
      employee: emp._id,
      employeeId: emp.employeeId,
      employeeName: emp.name,
      department: emp.department || "",
      designation: emp.designation || "",
      date: scheduleDate,
      fromTime: storeFrom,
      toTime: storeTo,
      assignedBy: req.user._id,
    });

    // ✅ Auto-create shift (planner reads this)
    await Shift.create({
      employee: emp._id,
      date: scheduleDate,
      startTime: storeFrom,
      endTime: storeTo,
    });

    return res.status(201).json({
      message: "Schedule created and shift updated",
      schedule,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Admin list
exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("employee", "name employeeId email gender department designation")
      .populate("assignedBy", "name")
      .sort({ date: 1 });

    return res.json(schedules);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Employee list
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