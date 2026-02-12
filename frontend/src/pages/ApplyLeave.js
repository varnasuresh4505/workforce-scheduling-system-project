import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ApplyLeave.css";
import Layout from "../components/Layout";

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
    try {
      const res = await axios.get("http://localhost:5000/api/leaves/my", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMyLeaves(res.data);
    } catch (err) {
      alert("Failed to load leave data");
    }
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

  const formatTime = (time) => {
    if (!time) return "-";
    const [hour, minute] = time.split(":");
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const formatStatus = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "-");

  return (
    <Layout>
      <div className="leavePg">
        <div className="leaveHeader">
          <h2 className="leaveTitle">Apply Leave</h2>
          <p className="leaveSub">Select dates, time range, and submit your reason</p>
        </div>

        {/* Form Card */}
        <div className="leaveCard">
          <h3 className="leaveSectionTitle">Leave Form</h3>

          <form className="leaveForm" onSubmit={applyLeave}>
            <div className="leaveField">
              <label className="leaveLabel">From Date</label>
              <input
                className="leaveInput"
                type="date"
                value={form.fromDate}
                onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                required
              />
            </div>

            <div className="leaveField">
              <label className="leaveLabel">To Date</label>
              <input
                className="leaveInput"
                type="date"
                value={form.toDate}
                onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                required
              />
            </div>

            <div className="leaveField">
              <label className="leaveLabel">Start Time</label>
              <input
                className="leaveInput"
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
              />
            </div>

            <div className="leaveField">
              <label className="leaveLabel">End Time</label>
              <input
                className="leaveInput"
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                required
              />
            </div>

            <div className="leaveField leaveFieldFull">
              <label className="leaveLabel">Reason</label>
              <input
                className="leaveInput"
                type="text"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Explain briefly (e.g., medical, personal)"
                required
              />
            </div>

            <button className="leaveBtn" type="submit">
              Submit Leave
            </button>
          </form>
        </div>

        {/* Table Card */}
        <div className="leaveCard">
          <h3 className="leaveSectionTitle">My Leave Status</h3>

          <div className="leaveTableWrap">
            <table className="leaveTable">
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
                    <td>
                      {formatTime(l.startTime)} - {formatTime(l.endTime)}
                    </td>
                    <td className="leaveReason">{l.reason}</td>
                    <td>
                      <span className={`leaveStatus ${l.status}`}>
                        {formatStatus(l.status)}
                      </span>
                    </td>
                  </tr>
                ))}

                {myLeaves.length === 0 && (
                  <tr>
                    <td colSpan="5" className="leaveEmpty">
                      No leave requests
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

export default ApplyLeave;