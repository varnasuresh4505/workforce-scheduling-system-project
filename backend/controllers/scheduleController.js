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

const overlaps = (startA, endA, startB, endB) => startA < endB && endA > startB;

// merge overlapping/adjacent intervals
const mergeIntervals = (arr) => {
  if (!arr.length) return [];
  const sorted = [...arr].sort((a, b) => a.start - b.start);
  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const cur = sorted[i];
    if (cur.start <= last.end) {
      last.end = Math.max(last.end, cur.end);
    } else {
      merged.push(cur);
    }
  }
  return merged;
};

// subtract blocked intervals from a single [start,end] interval
const subtractIntervals = (baseStart, baseEnd, blocked) => {
  let free = [{ start: baseStart, end: baseEnd }];

  for (const b of blocked) {
    const next = [];
    for (const slot of free) {
      if (!overlaps(slot.start, slot.end, b.start, b.end)) {
        next.push(slot);
        continue;
      }
      // cut out the overlap region
      if (slot.start < b.start) next.push({ start: slot.start, end: Math.min(b.start, slot.end) });
      if (slot.end > b.end) next.push({ start: Math.max(b.end, slot.start), end: slot.end });
    }
    free = next;
  }

  return free.filter((s) => s.end > s.start);
};

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

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return res.status(400).json({ message: "Invalid time format. Use HH:MM or HH:MM AM/PM" });
    }
    if (end <= start) return res.status(400).json({ message: "Invalid time range" });

    const scheduleDate = new Date(date);
    scheduleDate.setHours(0, 0, 0, 0);

    // ✅ Get approved leaves for this date
    const approvedLeaves = await Leave.find({
      employee: emp._id,
      status: "approved",
      fromDate: { $lte: scheduleDate },
      toDate: { $gte: scheduleDate },
    });

    // ✅ Make leave time intervals and merge them
    let leaveIntervals = approvedLeaves
      .map((lv) => ({
        start: toMinutes(lv.startTime),
        end: toMinutes(lv.endTime),
      }))
      .filter((x) => Number.isFinite(x.start) && Number.isFinite(x.end) && x.end > x.start);

    leaveIntervals = mergeIntervals(leaveIntervals);

    // ✅ Compute allowed/free time slots by subtracting leave intervals
    const freeSlots = subtractIntervals(start, end, leaveIntervals);

    // If fully blocked by leave, reject
    if (freeSlots.length === 0) {
      return res.status(400).json({
        message: "Cannot create schedule: employee is on approved leave during this entire time",
      });
    }

    // ✅ Preload existing schedules/shifts once
    const existingSchedules = await Schedule.find({
      employee: emp._id,
      date: scheduleDate,
    });

    const existingShifts = await Shift.find({
      employee: emp._id,
      date: scheduleDate,
    });

    // ✅ Check overlap for each free slot
    for (const slot of freeSlots) {
      const scheduleOverlap = existingSchedules.some((s) => {
        const oldStart = toMinutes(s.fromTime);
        const oldEnd = toMinutes(s.toTime);
        return overlaps(slot.start, slot.end, oldStart, oldEnd);
      });
      if (scheduleOverlap) {
        return res.status(400).json({
          message: `Schedule overlaps existing schedule for slot ${minutesToHHMM(slot.start)}-${minutesToHHMM(slot.end)}`,
        });
      }

      const shiftOverlap = existingShifts.some((sh) => {
        const oldStart = toMinutes(sh.startTime);
        const oldEnd = toMinutes(sh.endTime);
        return overlaps(slot.start, slot.end, oldStart, oldEnd);
      });
      if (shiftOverlap) {
        return res.status(400).json({
          message: `Schedule overlaps existing shift for slot ${minutesToHHMM(slot.start)}-${minutesToHHMM(slot.end)}`,
        });
      }
    }

    // ✅ Create schedules + shifts for each free slot
    const createdSchedules = [];

    for (const slot of freeSlots) {
      const slotFrom = minutesToHHMM(slot.start);
      const slotTo = minutesToHHMM(slot.end);

      const schedule = await Schedule.create({
        employee: emp._id,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.department || "",
        designation: emp.designation || "",
        date: scheduleDate,
        fromTime: slotFrom,
        toTime: slotTo,
        assignedBy: req.user._id,
      });

      await Shift.create({
        employee: emp._id,
        date: scheduleDate,
        startTime: slotFrom,
        endTime: slotTo,
      });

      createdSchedules.push(schedule);
    }

    return res.status(201).json({
      message:
        createdSchedules.length > 1
          ? "Schedule created by splitting around approved leave"
          : "Schedule created and shift updated",
      schedules: createdSchedules,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ keep as-is
exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("employee", "name employeeId email gender")
      .populate("assignedBy", "name")
      .sort({ date: 1 });

    return res.json(schedules);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

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