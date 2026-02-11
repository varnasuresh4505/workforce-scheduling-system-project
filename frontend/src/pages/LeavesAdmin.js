import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LeavesAdmin.css";

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

  return (
    <div className="admin-leaves">
      <h2>Leave Requests</h2>

      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>From</th>
            <th>To</th>
            <th>Time</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {leaves.map((l) => (
            <tr key={l._id}>
              <td>{l.employee?.name} <br /><small>{l.employee?.email}</small></td>
              <td>{new Date(l.fromDate).toLocaleDateString()}</td>
              <td>{new Date(l.toDate).toLocaleDateString()}</td>
              <td>{l.startTime} - {l.endTime}</td>
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
  );
}

export default LeavesAdmin;