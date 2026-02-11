const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },

    date: { type: Date, required: true },

    fromTime: { type: String, required: true }, // "10:00"
    toTime: { type: String, required: true },   // "17:00"

    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);