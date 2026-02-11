const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // ✅ changed
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    shift: {
      type: String,
      enum: ["Morning", "Evening", "Night"],
      required: true
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);