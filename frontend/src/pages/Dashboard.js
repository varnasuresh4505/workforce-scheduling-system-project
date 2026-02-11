import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalShifts: 0,
    totalSchedules: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data");
    }
  };

  return (
    <div className="dashboard">

      <div className="sidebar">
        <h2>WSS</h2>
        <ul>
          <li>Dashboard</li>
          <li>Employees</li>
          <li>Shifts</li>
          <li>Schedule</li>
          <li>Logout</li>
        </ul>
      </div>

      <div className="main-content">

        <div className="topbar">
          <h1>Admin Dashboard</h1>
          <div>Welcome, Admin</div>
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