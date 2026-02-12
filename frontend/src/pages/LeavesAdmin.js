import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LeavesAdmin.css";
import Layout from "../components/Layout"; // ✅ add this

function LeavesAdmin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    if (!user) return navigate("/");
    if (user.role !== "admin") return navigate("/dashboard");

    fetchLeaves();
    // eslint-disable-next-line
  }, []);

  const fetchLeaves = async () => {
    const res = await axios.get("http://localhost:5000/api/leaves", {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setLeaves(res.data);
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/leaves/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
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
    <div className="admin-leaves">
      <h2>Leave Requests</h2>

      <table>
        <thead>
          <tr>
            <th>Emp ID</th>
            <th>Employee</th>
            <th>From Date</th>
            <th>To Date</th>
            <th>Time</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {leaves.map((l) => (
            <tr key={l._id}>
              <td>{l.employee?.employeeId}</td>
              <td>{l.employee?.name} <br /><small>{l.employee?.email}</small></td>
              <td>{new Date(l.fromDate).toLocaleDateString()}</td>
              <td>{new Date(l.toDate).toLocaleDateString()}</td>
              <td>{formatTime(l.startTime)} - {formatTime(l.endTime)}</td>
              <td>{l.reason}</td>
              <td className={`status ${l.status}`}>{l.status}</td>
              <td className="actions">
                <button className="approve" onClick={() => updateStatus(l._id, "approved")}>
                  Approve
                </button>
                <button className="reject" onClick={() => updateStatus(l._id, "rejected")}>
                  Reject
                </button>
              </td>
            </tr>
          ))}

          {leaves.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No leave requests
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </Layout>
  );
}

export default LeavesAdmin;