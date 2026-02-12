import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Employees.css";
import Layout from "../components/Layout"; 
import { FiSearch } from "react-icons/fi";

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
  const [editing, setEditing] = useState(null); // employee object
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
    const q = search.toLowerCase();
    return (
      e.name?.toLowerCase().includes(q) ||
      e.employeeId?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
    <div className="emp-page">
      <h2>Employees (Admin)</h2>

      {/* Add Employee */}
      <div className="emp-form-card">
        <h3>Add Employee</h3>

        <div className="emp-form-grid">
          <input placeholder="Name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <input placeholder="Employee ID" value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />

          <input placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <input placeholder="Password" type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />

          <select value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input placeholder="Mobile" value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })} />

          <input placeholder="Address" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })} />
        
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
                    
          <button className="add-btn" onClick={handleAdd}>Add Employee</button>
        </div>
      </div>

      {/* Search */}
      <div className="emp-toolbar">
        <div className="search-box">
        <FiSearch className="search-icon" />
        <input
          className="search-input"
          placeholder=" Search name / employeeId / email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        </div>
        
      </div>

      {/* List */}
      <div className="emp-table-card">
        <table className="emp-table">
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Gender</th>
              <th>DOB</th>
              <th>Address</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((e) => (
              <tr key={e._id}>
                <td>{e.employeeId}</td>
                <td>{e.name}</td>
                <td>{e.email}</td>
                <td>{e.mobile || "-"}</td>
                <td>{e.gender || "-"}</td>
                <td>{e.dob ? new Date(e.dob).toLocaleDateString() : "-"}</td>
                <td style={{ maxWidth: 220 }}>{e.address || "-"}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button className="edit-btn" onClick={() => openEdit(e)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(e._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: 18 }}>
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Edit Employee</h3>

            <div className="modal-grid">
              <input value={editForm.name} placeholder="Name"
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <input value={editForm.employeeId} placeholder="Employee ID"
                onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })} />
              <input value={editForm.email} placeholder="Email"
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />

              <select value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <input value={editForm.mobile} placeholder="Mobile"
                onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} />
              <input value={editForm.address} placeholder="Address"
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
              <input type="date" value={editForm.dob}
                onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} />
            </div>

            <div className="modal-actions">
              <button className="save-btn" onClick={saveEdit}>Save</button>
              <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}

export default Employees;