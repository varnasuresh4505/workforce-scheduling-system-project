const Leave = require("../models/Leave");

// ✅ Employee applies leave
exports.applyLeave = async (req, res) => {
  try {
    const { fromDate, toDate, startTime, endTime, reason } = req.body;

    if (!fromDate || !toDate || !startTime || !endTime || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const leave = await Leave.create({
      employee: req.user._id,
      fromDate,
      toDate,
      startTime,
      endTime,
      reason,
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Employee views their leaves
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Admin views all leave requests
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "name email employeeId")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Admin approves/rejects leave
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body; // approved/rejected

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, reviewedBy: req.user._id },
      { new: true }
    )
      .populate("employee", "name email employeeId")
      .populate("reviewedBy", "name");

    res.json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};