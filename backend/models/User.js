const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    employeeId: {
      type: String,
      unique: true,
      sparse: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    gender: { type: String },
    mobile: { type: String },
    address: { type: String },
    dob: { type: Date },

    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);