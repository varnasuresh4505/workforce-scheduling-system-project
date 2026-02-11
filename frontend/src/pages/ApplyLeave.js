import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ApplyLeave.css";

function ApplyLeave() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [form, setForm] = useState({
    fromDate: "",
    toDate: "",
    startTime: "09:00",
    endTime: "17:00",
    reason: "",
  });

  const [myLeaves, setMyLeaves] = useState([]);

  useEffect(() => {
    if (!user) return navigate("/");
    if (user.role !== "employee") return navigate("/dashboard");

    fetchMyLeaves();
    // eslint-disable-next-line
  }, []);

  const fetchMyLeaves = async () => {
    const res = await axios.get("http://localhost:5000/api/leaves/my", {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setMyLeaves(res.data);
  };

  const applyLeave = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/leaves", form, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      alert("Leave Applied (Pending)");
      setForm({
        fromDate: "",
        toDate: "",
        startTime: "09:00",
        endTime: "17:00",
        reason: "",
      });
      fetchMyLeaves();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply leave");
    }
  };

  return (
    <div className="leave-page">
      <h2>Apply Leave</h2>

      <form className="leave-form" onSubmit={applyLeave}>
        <input type="date" value={form.fromDate}
          onChange={(e) => setForm({ ...form, fromDate: e.target.value })} required />

        <input type="date" value={form.toDate}
          onChange={(e) => setForm({ ...form, toDate: e.target.value })} required />

        <input type="time" value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />

        <input type="time" value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />

        <input type="text" placeholder="Reason"
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })} required />

        <button type="submit">Submit Leave</button>
      </form>

      <h3>My Leave Status</h3>
      <table>
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Time</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {myLeaves.map((l) => (
            <tr key={l._id}>
              <td>{new Date(l.fromDate).toLocaleDateString()}</td>
              <td>{new Date(l.toDate).toLocaleDateString()}</td>
              <td>{l.startTime} - {l.endTime}</td>
              <td>{l.reason}</td>
              <td className={`status ${l.status}`}>{l.status}</td>
            </tr>
          ))}
          {myLeaves.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>No leave requests</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ApplyLeave;