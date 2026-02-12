import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
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
    setForm((prev) => ({
      ...prev,
      employeeId: value,
      employeeName: emp ? emp.name : "",
    }));
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
      <div className="vv-sched-page">
        <div className="vv-sched-header">
          <h2 className="vv-sched-title">Schedules</h2>
          <p className="vv-sched-subtitle">Create schedules and view assigned shifts</p>
        </div>

        {/* FORM CARD */}
        <div className="vv-sched-card">
          <h3 className="vv-sched-cardTitle">Create Schedule</h3>

          <form className="vv-sched-form" onSubmit={createSchedule}>
            <div className="vv-sched-field">
              <label className="vv-sched-label">Employee ID</label>
              <select
                className="vv-sched-control"
                value={form.employeeId}
                onChange={(e) => handleEmpIdChange(e.target.value)}
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.employeeId}>
                    {emp.employeeId} - {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="vv-sched-field">
              <label className="vv-sched-label">Employee Name</label>
              <input
                className="vv-sched-control"
                type="text"
                value={form.employeeName}
                placeholder="Employee Name"
                readOnly
              />
            </div>

            <div className="vv-sched-field">
              <label className="vv-sched-label">Schedule Date</label>
              <input
                className="vv-sched-control"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>

            <div className="vv-sched-field">
              <label className="vv-sched-label">From Time</label>
              <input
                className="vv-sched-control"
                type="time"
                value={form.fromTime}
                onChange={(e) => setForm({ ...form, fromTime: e.target.value })}
                required
              />
            </div>

            <div className="vv-sched-field">
              <label className="vv-sched-label">To Time</label>
              <input
                className="vv-sched-control"
                type="time"
                value={form.toTime}
                onChange={(e) => setForm({ ...form, toTime: e.target.value })}
                required
              />
            </div>

            <div className="vv-sched-actions">
              <button className="vv-sched-btn" type="submit">
                Create Schedule
              </button>
            </div>
          </form>
        </div>

        {/* TABLE CARD */}
        <div className="vv-sched-card">
          <div className="vv-sched-tableTop">
            <h3 className="vv-sched-cardTitle">Employee Schedules</h3>
            <span className="vv-sched-count">{schedules.length} records</span>
          </div>

          <div className="vv-sched-tableWrap">
            <table className="vv-sched-table">
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
                    <td colSpan="5" className="vv-sched-empty">
                      No schedules yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Schedules;