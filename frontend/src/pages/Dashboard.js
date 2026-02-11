import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalShifts: 0,
    totalSchedules: 0,
    latestSchedules: [],
  });

  const [myLatestSchedules, setMyLatestSchedules] = useState([]);

  useEffect(() => {
    if (!user) return navigate("/");

    if (user.role === "admin") fetchAdminDashboard();
    else fetchEmployeeDashboard();
    // eslint-disable-next-line
  }, []);

  const fetchAdminDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error("Admin dashboard error", error);
    }
  };

  const fetchEmployeeDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/me", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMyLatestSchedules(res.data.myLatestSchedules || []);
    } catch (error) {
      console.error("Employee dashboard error", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      {/* Sidebar */}
      <div className="sidebar">
        <h2>WSS</h2>
        <ul>
          <li onClick={() => navigate("/dashboard")}>Dashboard</li>

          {user?.role === "admin" && (
            <>
              <li onClick={() => navigate("/employees")}>Employees</li>
              <li onClick={() => navigate("/shifts")}>Shifts</li>
              <li onClick={() => navigate("/schedules")}>Schedules</li>
              <li onClick={() => navigate("/leaves")}>Leave Requests</li>
            </>
          )}

          {user?.role === "employee" && (
            <>
              <li onClick={() => navigate("/my-schedule")}>My Schedule</li>
              <li onClick={() => navigate("/apply-leave")}>Apply Leave</li>
            </>
          )}

          <li onClick={handleLogout}>Logout</li>
        </ul>
      </div>

      {/* Main */}
      <div className="main-content">
        <div className="topbar">
          <h1>{user?.role === "admin" ? "Admin Dashboard" : "Employee Dashboard"}</h1>
          <div>Welcome, {user?.name}</div>
        </div>

        {/* Admin Cards */}
        {user?.role === "admin" && (
          <>
            <div className="card-container">
              <div className="card">
                <h3>Total Employees</h3>
                <p>{stats.totalEmployees}</p>
              </div>

              <div className="card">
                <h3>Total Shifts</h3>
                <p>{stats.totalShifts}</p>
              </div>

              <div className="card">
                <h3>Active Schedules</h3>
                <p>{stats.totalSchedules}</p>
              </div>
            </div>

            {/* ✅ Updated Schedule (latest schedules) */}
            <div className="section">
              <h2>Updated Schedules</h2>

              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Shift</th>
                    <th>Assigned By</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.latestSchedules?.map((s) => (
                    <tr key={s._id}>
                      <td>{s.employee?.name}</td>
                      <td>{new Date(s.date).toLocaleDateString()}</td>
                      <td>{s.shift}</td>
                      <td>{s.assignedBy?.name || "-"}</td>
                    </tr>
                  ))}

                  {(!stats.latestSchedules || stats.latestSchedules.length === 0) && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", padding: "18px" }}>
                        No schedules updated yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Employee Updated Schedule */}
        {user?.role === "employee" && (
          <div className="section">
            <h2>My Updated Schedules</h2>

            <table className="dash-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shift</th>
                  <th>Assigned By</th>
                </tr>
              </thead>
              <tbody>
                {myLatestSchedules.map((s) => (
                  <tr key={s._id}>
                    <td>{new Date(s.date).toLocaleDateString()}</td>
                    <td>{s.shift}</td>
                    <td>{s.assignedBy?.name || "-"}</td>
                  </tr>
                ))}

                {myLatestSchedules.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", padding: "18px" }}>
                      No schedule assigned yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;