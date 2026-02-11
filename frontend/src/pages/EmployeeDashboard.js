import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EmployeeDashboard.css";

function EmployeeDashboard() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    const res = await axios.get("http://localhost:5000/api/dashboard/me", {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    });
    setData(res.data);
  };

  if (!data) return <p style={{ padding: 20 }}>Loading...</p>;

  const u = data.user;

  // ✅ Put your image in: frontend/public/profile.png
  // or change this path to your file name
  const profileImg = "/profile.png";

  return (
    <div className="emp-page">
      <h2 className="emp-title">My Profile</h2>

      <div className="profile-card">
        {/* Left photo */}
        <div className="profile-left">
          <img
            className="profile-img"
            src={`/photos/${u.employeeId}.png`}
            onError={(e) => (e.target.src = "/default-profile.png")}
            alt="Profile"
            />
        </div>

        {/* Right details */}
        <div className="profile-right">
          <div className="profile-header">
            <div className="profile-name">
              {u.name}
              <span className="status-dot" title="Active" />
            </div>

            
          </div>

          <div className="profile-grid">
            <div className="field">
              <div className="label">Employee ID</div>
              <div className="value">{u.employeeId || "-"}</div>
            </div>

            <div className="field">
              <div className="label">Email</div>
              <div className="value">{u.email || "-"}</div>
            </div>

            <div className="field">
              <div className="label">Mobile</div>
              <div className="value">{u.mobile || "-"}</div>
            </div>

            <div className="field">
              <div className="label">Gender</div>
              <div className="value">{u.gender || "-"}</div>
            </div>

            <div className="field">
              <div className="label">Date of Birth</div>
              <div className="value">
                {u.dob ? new Date(u.dob).toLocaleDateString() : "-"}
              </div>
            </div>

            <div className="field">
              <div className="label">Total Hours (This Week)</div>
              <div className="value">{data.totalHours || "0.00"}</div>
            </div>

            <div className="field full">
              <div className="label">Address</div>
              <div className="value">{u.address || "-"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;