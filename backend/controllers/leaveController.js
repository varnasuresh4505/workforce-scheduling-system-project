const Leave = require("../models/Leave");

// Employee applies leave
exports.applyLeave = async (req, res) => {
  try {
    const leave = await Leave.create({
      employee: req.user._id,   // ✅ fixed
      fromDate: req.body.fromDate,
      toDate: req.body.toDate,
      reason: req.body.reason
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin gets all leave requests
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
    .populate("employee", "name email")
    .populate("reviewedBy", "name");

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin approves/rejects leave
exports.updateLeaveStatus = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        reviewedBy: req.user._id
      },
      { new: true }
    );

    res.json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};