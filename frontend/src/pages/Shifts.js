import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Shifts.css";

function Shifts() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [form, setForm] = useState({
    employeeId: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    if (!user) return navigate("/");
    if (user.role !== "admin") return navigate("/dashboard");

    fetchEmployees();
    fetchShifts();
    // eslint-disable-next-line
  }, []);

  const fetchEmployees = async () => {
    const res = await axios.get("http://localhost:5000/api/employees", {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setEmployees(res.data);
  };

  const fetchShifts = async () => {
    const res = await axios.get("http://localhost:5000/api/shifts", {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setShifts(res.data);
  };

  const createShift = async (e) => {
    e.preventDefault();

    if (!form.employeeId || !form.date || !form.startTime || !form.endTime) {
      alert("Fill all fields");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/shifts", form, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      alert("Shift created");
      setForm({ employeeId: "", date: "", startTime: "", endTime: "" });
      fetchShifts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create shift");
    }
  };

  return (
    <div className="shifts-container">
      <h2>Shifts (Admin)</h2>

      <form className="shift-form" onSubmit={createShift}>
        <select
          value={form.employeeId}
          onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name} ({emp.email})
            </option>
          ))}
        </select>

        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <input
          type="time"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
        />
        <input
          type="time"
          value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
        />

        <button type="submit">Create Shift</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Employee</th>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((s) => (
            <tr key={s._id}>
                <td>{s.employeeId}</td>
              <td>{s.employee?.name}</td>
              <td>{new Date(s.date).toLocaleDateString()}</td>
              <td>{s.startTime}</td>
              <td>{s.endTime}</td>
            </tr>
          ))}
          {shifts.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                No shifts found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Shifts;