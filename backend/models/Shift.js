const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true
    },

    startTime: {
      type: String // HH:mm
    },

    endTime: {
      type: String // HH:mm
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shift", shiftSchema);