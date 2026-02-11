const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },     // ✅ Date (not String)
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "17:00"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shift", shiftSchema);