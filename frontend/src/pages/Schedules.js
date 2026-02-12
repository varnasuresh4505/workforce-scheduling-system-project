import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout"; // ✅ add this
import "./Schedules.css";

function Schedules() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [form, setForm] = useState({
    employeeId: "",
    employeeName: "",
    date: "",
    fromTime: "",
    toTime: "",
  });

  useEffect(() => {
    if (!user) return navigate("/");
    if (user.role !== "admin") return navigate("/dashboard");

    fetchEmployees();
    fetchSchedules();
    // eslint-disable-next-line
  }, []);

  const fetchEmployees = async () => {
    const res = await axios.get("http://localhost:5000/api/employees", {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setEmployees(res.data);
  };

  const fetchSchedules = async () => {
    const res = await axios.get("http://localhost:5000/api/schedules", {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setSchedules(res.data);
  };

  const handleEmpIdChange = (value) => {
    const emp = employees.find((e) => e.employeeId === value);
    setForm({
      ...form,
      employeeId: value,
      employeeName: emp ? emp.name : "",
    });
  };

  const createSchedule = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/schedules",
        {
          employeeId: form.employeeId,
          date: form.date,
          fromTime: form.fromTime,
          toTime: form.toTime,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      alert("Schedule created ✅ Shift updated in planner!");
      setForm({ employeeId: "", employeeName: "", date: "", fromTime: "", toTime: "" });
      fetchSchedules();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create schedule");
    }
  };

  const formatTime = (time) => {
  if (!time) return "-";
  const [hour, minute] = time.split(":");
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHour = h % 12 || 12;
  return `${formattedHour}:${minute} ${ampm}`;
};

  return (
    <Layout>
      <div className="sched-page">
        <h2>Schedule</h2>

        <form className="sched-form" onSubmit={createSchedule}>
          <select value={form.employeeId} onChange={(e) => handleEmpIdChange(e.target.value)}>
            <option value="">Select Employee ID</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp.employeeId}>
                {emp.employeeId} - {emp.name}
              </option>
            ))}
          </select>

          <input type="text" value={form.employeeName} placeholder="Employee Name" readOnly />

          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input type="time" value={form.fromTime} onChange={(e) => setForm({ ...form, fromTime: e.target.value })} />
          <input type="time" value={form.toTime} onChange={(e) => setForm({ ...form, toTime: e.target.value })} />

          <button type="submit">Create Schedule</button>
        </form>

        <h3>Employee Schedules</h3>
        <table>
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Assigned By</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s._id}>
                <td>{s.employeeId}</td>
                <td>{s.employeeName}</td>
                <td>{new Date(s.date).toLocaleDateString()}</td>
                <td>
                  {formatTime(s.fromTime)} - {formatTime(s.toTime)}
                </td>
                <td>{s.assignedBy?.name || "-"}</td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "16px" }}>
                  No schedules yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default Schedules;