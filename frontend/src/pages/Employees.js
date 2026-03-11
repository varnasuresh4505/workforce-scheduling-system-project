// Employees.jsx (FULL corrected code)

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Popup from "../components/Popup";
import "./Employees.css";
import { FiSearch, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

function Employees() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  const [pop, setPop] = useState({ open: false, type: "success", message: "" });

  // add modal
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    department: "",
    designation: "",
    age: "",
    dob: "",
    address: "",
    mobile: "",
    email: "",
    password: "",
    gender: "", // ✅ ensure exists
  });

  // edit modal
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    employeeId: "",
    name: "",
    department: "",
    designation: "",
    age: "",
    dob: "",
    address: "",
    mobile: "",
    email: "",
    gender: "", // ✅ FIX: add gender
  });

  useEffect(() => {
    if (!user) return navigate("/");
    if (user.role !== "admin") return navigate("/dashboard");
    fetchEmployees();
    // eslint-disable-next-line
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/employees/with-hours",
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setEmployees(res.data);
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: err.response?.data?.message || "Failed to fetch employees",
      });
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return employees;

    return employees.filter((e) => {
      return (
        e.name?.toLowerCase().includes(q) ||
        e.employeeId?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.designation?.toLowerCase().includes(q)
      );
    });
  }, [employees, search]);

  const openAdd = () => {
    setForm({
      employeeId: "",
      name: "",
      department: "",
      designation: "",
      age: "",
      dob: "",
      address: "",
      mobile: "",
      email: "",
      password: "",
      gender: "",
    });
    setAddOpen(true);
  };

  const addEmployee = async () => {
    try {
      await axios.post("http://localhost:5000/api/employees", form, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAddOpen(false);
      setPop({
        open: true,
        type: "success",
        message: "Staff/Employee created successfully ✅",
      });
      fetchEmployees();
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: err.response?.data?.message || "Failed to add employee",
      });
    }
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setEditForm({
      employeeId: emp.employeeId || "",
      name: emp.name || "",
      department: emp.department || "",
      designation: emp.designation || "",
      age: emp.age || "",
      dob: emp.dob ? new Date(emp.dob).toISOString().split("T")[0] : "",
      address: emp.address || "",
      mobile: emp.mobile || "",
      email: emp.email || "",
      gender: emp.gender || "", // ✅ FIX: set gender from backend
    });
  };

  const saveEdit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/employees/${editing._id}`,
        editForm,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setEditing(null);
      setPop({
        open: true,
        type: "success",
        message: "Employee updated successfully ✅",
      });
      fetchEmployees();
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: err.response?.data?.message || "Failed to update employee",
      });
    }
  };

  const removeEmployee = async (id) => {
    const ok = window.confirm("Delete this employee?");
    if (!ok) return;
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPop({ open: true, type: "success", message: "Employee deleted ✅" });
      fetchEmployees();
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: err.response?.data?.message || "Failed to delete employee",
      });
    }
  };

  const pad2 = (n) => String(n).padStart(2, "0");
  const formatDDMMYYYY = (dateValue) => {
    if (!dateValue) return "-";
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "-";
    return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
  };

  return (
    <Layout>
      <Popup
        open={pop.open}
        type={pop.type}
        message={pop.message}
        onClose={() => setPop({ ...pop, open: false })}
      />

      <div className="vvEmp-page">
        {/* fixed header row */}
        <div className="vvEmp-topRow">
          <div>
            <div className="vvEmp-title">Employees</div>
            <div className="vvEmp-sub">Search and manage hospital staff</div>
          </div>

          <button className="vvEmp-addTopBtn" onClick={openAdd} type="button">
            <FiPlus /> Add Employee
          </button>
        </div>

        {/* fixed search */}
        <div className="vvEmp-searchRow">
          <FiSearch className="vvEmp-searchIcon" />
          <input
            className="vvEmp-searchInput"
            placeholder="Search staff id / name / dept / designation / email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* scroll area only for cards */}
        <div className="vvEmp-scrollArea">
          {filtered.map((u) => (
            <div key={u._id} className="vvEmp-card">
              <div className="vvEmp-cardLeft">
                <img
                  className="vvEmp-avatar"
                  src={`/photos/${u.employeeId}.png`}
                  onError={(e) => (e.target.src = "/default-profile.png")}
                  alt="Profile"
                />
              </div>

              <div className="vvEmp-cardRight">
                <div className="vvEmp-cardTop">
                  <div className="vvEmp-nameRow">
                    <div className="vvEmp-name">{u.name}</div>
                    <span className="vvEmp-dot" title="Active" />
                  </div>

                  <div className="vvEmp-actions">
                    <button
                      className="vvEmp-iconBtn"
                      onClick={() => openEdit(u)}
                      type="button"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="vvEmp-iconBtn danger"
                      onClick={() => removeEmployee(u._id)}
                      type="button"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="vvEmp-grid">
                  <div className="vvEmp-field">
                    <div className="vvEmp-label">Staff ID</div>
                    <div className="vvEmp-value">{u.employeeId || "-"}</div>
                  </div>

                  <div className="vvEmp-field">
                    <div className="vvEmp-label">Staff Name</div>
                    <div className="vvEmp-value">{u.name || "-"}</div>
                  </div>

                  <div className="vvEmp-field">
                    <div className="vvEmp-label">Department</div>
                    <div className="vvEmp-value">{u.department || "-"}</div>
                  </div>

                  <div className="vvEmp-field">
                    <div className="vvEmp-label">Designation</div>
                    <div className="vvEmp-value">{u.designation || "-"}</div>
                  </div>

                  <div className="vvEmp-field">
                    <div className="vvEmp-label">Email</div>
                    <div className="vvEmp-value">{u.email || "-"}</div>
                  </div>

                  <div className="vvEmp-field">
                    <div className="vvEmp-label">Contact</div>
                    <div className="vvEmp-value">{u.mobile || "-"}</div>
                  </div>

                  <div className="vvEmp-field">
                    <div className="vvEmp-label">Gender</div>
                    <div className="vvEmp-value">{u.gender || "-"}</div>
                  </div>

                  <div className="vvEmp-field">
                    <div className="vvEmp-label">Date of Birth</div>
                    <div className="vvEmp-value">{formatDDMMYYYY(u.dob)}</div>
                  </div>

                  <div className="vvEmp-field">
                    <div className="vvEmp-label">Total Hours (This Week)</div>
                    <div className="vvEmp-value">
                      {u.totalHours ? `${u.totalHours} hrs` : "0.00 hrs"}
                    </div>
                  </div>

                  <div className="vvEmp-field full">
                    <div className="vvEmp-label">Address</div>
                    <div className="vvEmp-value">{u.address || "-"}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="vvEmp-empty">No employees found</div>
          )}
        </div>

        {/* ADD MODAL */}
        {/* ADD MODAL (WITH LABELS LIKE SCREENSHOT) */}
{addOpen && (
  <div className="vvEmp-modalOverlay" onClick={() => setAddOpen(false)}>
    <div className="vvEmp-modal big" onClick={(e) => e.stopPropagation()}>
      <div className="vvEmp-modalHead">
        <h3 className="vvEmp-modalTitle">Add Employee</h3>

        <button
          className="vvEmp-closeBtn"
          onClick={() => setAddOpen(false)}
          type="button"
        >
          ✕
        </button>
      </div>

      <div className="vvEmp-formGrid">
        <div className="vvEmp-field2">
          <label>Staff ID</label>
          <input
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            placeholder="Enter Staff ID"
          />
        </div>

        <div className="vvEmp-field2">
          <label>Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter Name"
          />
        </div>

        <div className="vvEmp-field2">
          <label>Department</label>
          <input
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            placeholder="Enter Department"
          />
        </div>

        <div className="vvEmp-field2">
          <label>Designation</label>
          <input
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
            placeholder="Enter Designation"
          />
        </div>

        <div className="vvEmp-field2">
          <label>Gender</label>
          <select
            value={form.gender || ""}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="vvEmp-field2">
          <label>Date of Birth</label>
          <input
            type="date"
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
          />
        </div>

        <div className="vvEmp-field2 full">
          <label>Address</label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Enter Address"
          />
        </div>

        <div className="vvEmp-field2">
          <label>Contact</label>
          <input
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            placeholder="Enter Contact Number"
          />
        </div>

        <div className="vvEmp-field2">
          <label>Email</label>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Enter Email"
          />
        </div>

        <div className="vvEmp-field2">
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Enter Password"
          />
        </div>
      </div>

      <div className="vvEmp-modalActions">
        <button className="vvEmp-btn primary" onClick={addEmployee} type="button">
          Create
        </button>
        <button className="vvEmp-btn" onClick={() => setAddOpen(false)} type="button">
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
        {/* EDIT MODAL */}
        {editing && (
          <div className="vvEmp-modalOverlay" onClick={() => setEditing(null)}>
            <div className="vvEmp-modal" onClick={(e) => e.stopPropagation()}>
              <div className="vvEmp-modalTitle">Edit Employee</div>

              <div className="vvEmp-modalGrid">
                <input
                  placeholder="Staff ID"
                  value={editForm.employeeId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, employeeId: e.target.value })
                  }
                />
                <input
                  placeholder="Name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
                <input
                  placeholder="Department"
                  value={editForm.department}
                  onChange={(e) =>
                    setEditForm({ ...editForm, department: e.target.value })
                  }
                />
                <input
                  placeholder="Designation"
                  value={editForm.designation}
                  onChange={(e) =>
                    setEditForm({ ...editForm, designation: e.target.value })
                  }
                />

                {/* ✅ FIX: gender dropdown */}
                <select
                  value={editForm.gender}
                  onChange={(e) =>
                    setEditForm({ ...editForm, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="date"
                  value={editForm.dob}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dob: e.target.value })
                  }
                />
                <input
                  placeholder="Address"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                />
                <input
                  placeholder="Contact"
                  value={editForm.mobile}
                  onChange={(e) =>
                    setEditForm({ ...editForm, mobile: e.target.value })
                  }
                />
                <input
                  placeholder="Mail"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>

              <div className="vvEmp-modalActions">
                <button
                  className="vvEmp-btn primary"
                  onClick={saveEdit}
                  type="button"
                >
                  Save
                </button>
                <button
                  className="vvEmp-btn"
                  onClick={() => setEditing(null)}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Employees;
