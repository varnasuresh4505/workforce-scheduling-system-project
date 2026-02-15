const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    // Existing fields (keep)
    gender: { type: String },
    mobile: { type: String },
    address: { type: String },
    dob: { type: Date },

    // ✅ Hospital fields (NEW)
    department: { type: String },      // e.g., ICU, OPD, Emergency
    designation: { type: String },     // e.g., Nurse, Doctor, Technician
    contact: { type: String },         // optional separate contact field
             // optional (can be derived from dob)

    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);