import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import "./Employees.css";
import { FiSearch } from "react-icons/fi";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

function Employees() {
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  // add form
  const [form, setForm] = useState({
    name: "",
    employeeId: "",
    email: "",
    password: "",
    gender: "",
    mobile: "",
    address: "",
    dob: "",
  });

  // edit modal
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    employeeId: "",
    email: "",
    gender: "",
    mobile: "",
    address: "",
    dob: "",
  });

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEmployees(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch employees");
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post("http://localhost:5000/api/employees", form, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      alert("Employee Added ✅");
      setForm({
        name: "",
        employeeId: "",
        email: "",
        password: "",
        gender: "",
        mobile: "",
        address: "",
        dob: "",
      });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add employee");
    }
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setEditForm({
      name: emp.name || "",
      employeeId: emp.employeeId || "",
      email: emp.email || "",
      gender: emp.gender || "",
      mobile: emp.mobile || "",
      address: emp.address || "",
      dob: emp.dob ? new Date(emp.dob).toISOString().split("T")[0] : "",
    });
  };

  const saveEdit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/employees/${editing._id}`,
        editForm,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      alert("Employee Updated ✅");
      setEditing(null);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update employee");
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this employee?");
    if (!ok) return;

    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      alert("Employee Deleted ✅");
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete employee");
    }
  };

  const filteredEmployees = employees.filter((e) => {
    const q = search.toLowerCase().trim();
    return (
      e.name?.toLowerCase().includes(q) ||
      e.employeeId?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div className="empadm-page">
        <div className="empadm-header">
          <h2 className="empadm-title">Employees Information</h2>
          <p className="empadm-subtitle">Add, search, update and delete employees</p>
        </div>

        {/* Add Employee */}
        <div className="empadm-formCard">
          <h3 className="empadm-sectionTitle">Add Employee</h3>

          <div className="empadm-formGrid">
            <input
              placeholder="Employee Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Employee ID"
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            />

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <input
              placeholder="Mobile"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            />

            <input
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <input
              type="text"
              placeholder="Date of Birth"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />

            <button className="empadm-addBtn" onClick={handleAdd}>
              Add Employee
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="empadm-searchRow">
          <div className="empadm-searchBox">
            <FiSearch className="empadm-searchIcon" />
            <input
              className="empadm-searchInput"
              placeholder="Search name / employeeId / email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Cards list */}
        <div className="empadm-cards">
          {filteredEmployees.map((u) => (
            <div key={u._id} className="empadm-card">
              <div className="empadm-cardLeft">
                <img
                  className="empadm-avatar"
                  src={`/photos/${u.employeeId}.png`}
                  onError={(e) => (e.target.src = "/default-profile.png")}
                  alt="Profile"
                />
              </div>

              <div className="empadm-cardRight">
                <div className="empadm-cardTop">
                  <div className="empadm-nameRow">
                    <div className="empadm-name">{u.name}</div>
                    <span className="empadm-statusDot" title="Active" />
                  </div>

                  <div className="empadm-actions">
                    <button
                      className="empadm-iconBtn"
                      onClick={() => openEdit(u)}
                      title="Edit"
                      type="button"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="empadm-iconBtn empadm-dangerBtn"
                      onClick={() => handleDelete(u._id)}
                      title="Delete"
                      type="button"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="empadm-grid">
                  <div className="empadm-field">
                    <div className="empadm-label">Employee ID</div>
                    <div className="empadm-value">{u.employeeId || "-"}</div>
                  </div>

                  <div className="empadm-field">
                    <div className="empadm-label">Email</div>
                    <div className="empadm-value">{u.email || "-"}</div>
                  </div>

                  <div className="empadm-field">
                    <div className="empadm-label">Mobile</div>
                    <div className="empadm-value">{u.mobile || "-"}</div>
                  </div>

                  <div className="empadm-field">
                    <div className="empadm-label">Gender</div>
                    <div className="empadm-value">{u.gender || "-"}</div>
                  </div>

                  <div className="empadm-field">
                    <div className="empadm-label">Date of Birth</div>
                    <div className="empadm-value">
                      {u.dob ? new Date(u.dob).toLocaleDateString() : "-"}
                    </div>
                  </div>

                  <div className="empadm-field empadm-fieldFull">
                    <div className="empadm-label">Address</div>
                    <div className="empadm-value">{u.address || "-"}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredEmployees.length === 0 && (
            <div className="empadm-empty">No employees found</div>
          )}
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="empadm-modalOverlay">
            <div className="empadm-modalCard">
              <h3 className="empadm-sectionTitle">Edit Employee</h3>

              <div className="empadm-modalGrid">
                <input
                  value={editForm.name}
                  placeholder="Name"
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
                <input
                  value={editForm.employeeId}
                  placeholder="Employee ID"
                  onChange={(e) =>
                    setEditForm({ ...editForm, employeeId: e.target.value })
                  }
                />
                <input
                  value={editForm.email}
                  placeholder="Email"
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />

                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  value={editForm.mobile}
                  placeholder="Mobile"
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                />
                <input
                  value={editForm.address}
                  placeholder="Address"
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                />
                <input
                  type="date"
                  value={editForm.dob}
                  onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                />
              </div>

              <div className="empadm-modalActions">
                <button className="empadm-saveBtn" onClick={saveEdit}>
                  Save
                </button>
                <button className="empadm-cancelBtn" onClick={() => setEditing(null)}>
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