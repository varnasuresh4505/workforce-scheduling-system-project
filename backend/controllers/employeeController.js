const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Shift = require("../models/Shift");

// helper: week start (Mon)
const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const toMinutes = (t) => {
  const [h, m] = String(t).split(":").map(Number);
  return h * 60 + m;
};

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
      contact,
      address,
      dob,
      age,
      department,
      designation,
    } = req.body;

    if (!name || !employeeId || !email || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const exists = await User.findOne({ $or: [{ email }, { employeeId }] });
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
      contact,
      address,
      dob,
      age,

      department,
      designation,

      role: "employee",
    });

    return res.status(201).json({
      message: "Employee created successfully",
      employee: {
        _id: employee._id,
        name: employee.name,
        employeeId: employee.employeeId,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        role: employee.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✏️ Update employee (Admin only)
exports.updateEmployee = async (req, res) => {
  try {
    const {
      name,
      employeeId,
      email,
      gender,
      mobile,
      contact,
      address,
      dob,
      age,
      department,
      designation,
    } = req.body;

    const employee = await User.findById(req.params.id);

    if (!employee || employee.role !== "employee") {
      return res.status(404).json({ message: "Employee not found" });
    }

    // duplicate email
    if (email && email !== employee.email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: employee._id },
      });
      if (emailExists) {
        return res.status(400).json({ message: "Email already used by another user" });
      }
      employee.email = email;
    }

    // duplicate employeeId
    if (employeeId && employeeId !== employee.employeeId) {
      const idExists = await User.findOne({
        employeeId,
        _id: { $ne: employee._id },
      });
      if (idExists) {
        return res.status(400).json({ message: "Employee ID already used by another user" });
      }
      employee.employeeId = employeeId;
    }

    // update other fields
    if (name !== undefined) employee.name = name;
    if (gender !== undefined) employee.gender = gender;
    if (mobile !== undefined) employee.mobile = mobile;
    if (contact !== undefined) employee.contact = contact;
    if (address !== undefined) employee.address = address;
    if (dob !== undefined) employee.dob = dob;
    if (age !== undefined) employee.age = age;

    if (department !== undefined) employee.department = department;
    if (designation !== undefined) employee.designation = designation;

    const updated = await employee.save();

    return res.status(200).json({
      message: "Employee updated successfully",
      employee: {
        _id: updated._id,
        name: updated.name,
        employeeId: updated.employeeId,
        email: updated.email,
        department: updated.department,
        designation: updated.designation,
        gender: updated.gender,
        mobile: updated.mobile,
        contact: updated.contact,
        address: updated.address,
        dob: updated.dob,
        age: updated.age,
        role: updated.role,
      },
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

// 📋 Get all employees (existing)
exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select("-password");
    return res.status(200).json(employees);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: Get all employees with weekly total hours (Admin only)
exports.getEmployeesWithHours = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select("-password");

    const weekStart = startOfWeek(new Date());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const result = [];

    for (const emp of employees) {
      const shifts = await Shift.find({
        employee: emp._id,
        date: { $gte: weekStart, $lte: weekEnd },
      });

      let totalMinutes = 0;
      shifts.forEach((s) => {
        totalMinutes += toMinutes(s.endTime) - toMinutes(s.startTime);
      });

      result.push({
        ...emp.toObject(),
        totalHours: (totalMinutes / 60).toFixed(2),
      });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};