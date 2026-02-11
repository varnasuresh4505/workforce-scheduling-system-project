import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EmployeeDashboard.css";

function EmployeeDashboard() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get("http://localhost:5000/api/dashboard/me", {
      headers: { Authorization: `Bearer ${userInfo.token}` }
    });
    setData(res.data);
  };

  if (!data) return <p>Loading...</p>;

  const u = data.user;

  return (
    <div className="emp-container">
      <h2>My Profile</h2>

      <div className="emp-card">
        <p><strong>Name:</strong> {u.name}</p>
        <p><strong>Employee ID:</strong> {u.employeeId}</p>
        <p><strong>Gender:</strong> {u.gender}</p>
        <p><strong>Mobile:</strong> {u.mobile}</p>
        <p><strong>Address:</strong> {u.address}</p>
        <p><strong>DOB:</strong> {new Date(u.dob).toLocaleDateString()}</p>
        <p><strong>Total Hours This Week:</strong> {data.totalHours}</p>
      </div>
    </div>
  );
}

export default EmployeeDashboard;