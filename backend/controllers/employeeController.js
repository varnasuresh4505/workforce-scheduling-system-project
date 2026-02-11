const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ➕ Add Employee (Admin only)
exports.addEmployee = async (req, res) => {
  try {
    const {
      name,
      employeeId,
      email,
      password,
      gender,
      mobile,
      address,
      dob
    } = req.body;

    if (!name || !employeeId || !email || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const exists = await User.findOne({
      $or: [{ email }, { employeeId }]
    });

    if (exists) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const employee = await User.create({
      name,
      employeeId,
      email,
      password: hashedPassword,
      gender,
      mobile,
      address,
      dob,
      role: "employee"
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update employee
// ✏️ Update employee (Admin only)
exports.updateEmployee = async (req, res) => {
  try {
    const {
      name,
      employeeId,
      email,
      gender,
      mobile,
      address,
      dob
    } = req.body;

    const employee = await User.findById(req.params.id);

    if (!employee || employee.role !== "employee") {
      return res.status(404).json({ message: "Employee not found" });
    }

    // ✅ check duplicate email (if changed)
    if (email && email !== employee.email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: employee._id }
      });
      if (emailExists) {
        return res.status(400).json({ message: "Email already used by another user" });
      }
      employee.email = email;
    }

    // ✅ check duplicate employeeId (if changed)
    if (employeeId && employeeId !== employee.employeeId) {
      const idExists = await User.findOne({
        employeeId,
        _id: { $ne: employee._id }
      });
      if (idExists) {
        return res.status(400).json({ message: "Employee ID already used by another user" });
      }
      employee.employeeId = employeeId;
    }

    // ✅ update other fields safely
    if (name !== undefined) employee.name = name;
    if (gender !== undefined) employee.gender = gender;
    if (mobile !== undefined) employee.mobile = mobile;
    if (address !== undefined) employee.address = address;
    if (dob !== undefined) employee.dob = dob;

    const updated = await employee.save();

    return res.status(200).json({
      message: "Employee updated successfully",
      employee: {
        _id: updated._id,
        name: updated.name,
        employeeId: updated.employeeId,
        email: updated.email,
        gender: updated.gender,
        mobile: updated.mobile,
        address: updated.address,
        dob: updated.dob,
        role: updated.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// 🗑️ Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee || employee.role !== "employee") {
      return res.status(404).json({ message: "Employee not found" });
    }

    await employee.deleteOne();
    return res.status(200).json({ message: "Employee removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 📋 Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select("-password");
    return res.status(200).json(employees);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};