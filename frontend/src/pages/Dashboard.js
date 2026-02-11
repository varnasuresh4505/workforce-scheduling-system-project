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
    totalSchedules: 0
  });

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/dashboard/stats",
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <div className="dashboard">
      
      {/* Sidebar */}
      <div className="sidebar">
        <h2>WSS</h2>
        <ul>
          <li onClick={() => navigate("/dashboard")}>Dashboard</li>

          {/* Admin Only */}
          {user?.role === "admin" && (
            <>
              <li onClick={() => navigate("/employees")}>Employees</li>
              <li onClick={() => navigate("/shifts")}>Shifts</li>
              <li onClick={() => navigate("/schedules")}>Schedule</li>
            </>
          )}

          {/* Employee View */}
          {user?.role === "employee" && (
            <li onClick={() => navigate("/my-schedule")}>
              My Schedule
            </li>
          )}

          <li onClick={handleLogout}>Logout</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">

        <div className="topbar">
          <h1>
            {user?.role === "admin"
              ? "Admin Dashboard"
              : "Employee Dashboard"}
          </h1>
          <div>Welcome, {user?.name}</div>
        </div>

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

      </div>
    </div>
  );
}

export default Dashboard;