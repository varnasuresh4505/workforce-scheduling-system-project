import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { NavLink, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Popup from "../components/Popup";
import "./Dashboard.css";

const pad2 = (n) => String(n).padStart(2, "0");

const formatDDMMYYYY = (dateValue) => {
  const d = new Date(dateValue);
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
};

const formatAMPM = (time) => {
  if (!time) return "-";
  const t = String(time).trim();

  if (/am|pm/i.test(t)) {
    return t.replace(/\s+/g, "").toUpperCase();
  }

  const parts = t.split(":");
  const h = parseInt(parts[0], 10);
  const m = parts[1] || "00";
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${pad2(hour12)}:${m}${ampm}`;
};

const statusFromNow = (dateValue, fromTime, toTime) => {
  const now = new Date();
  const d = new Date(dateValue);
  d.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (d.getTime() !== today.getTime()) {
    // future day = Inactive, past day = Completed
    return d.getTime() > today.getTime() ? "inactive" : "completed";
  }

  // Same day -> compare time
  const [fh, fm] = fromTime.split(":").map(Number);
  const [th, tm] = toTime.split(":").map(Number);

  const start = new Date();
  start.setHours(fh, fm, 0, 0);

  const end = new Date();
  end.setHours(th, tm, 0, 0);

  if (now >= start && now <= end) return "active";
  if (now > end) return "completed";
  return "inactive";
};

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [pop, setPop] = useState({ open: false, type: "success", message: "" });

  const [adminData, setAdminData] = useState({
    totalEmployees: 0,
    todayPresent: 0,
    todayShifts: 0,
    latestSchedules: [],
  });

  const [empData, setEmpData] = useState({
    user: null,
    totalHours: "0.00",
    mySchedules: [],
  });

  useEffect(() => {
    if (!user) return navigate("/");
    if (user.role === "admin") fetchAdmin();
    else fetchEmployee();
    // eslint-disable-next-line
  }, []);

  const fetchAdmin = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAdminData(res.data);
    } catch (err) {
      setPop({ open: true, type: "error", message: "Failed to load admin dashboard" });
    }
  };

  const fetchEmployee = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/me", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEmpData(res.data);
    } catch (err) {
      setPop({ open: true, type: "error", message: "Failed to load employee dashboard" });
    }
  };

  const rows = useMemo(() => {
    const list = user?.role === "admin" ? adminData.latestSchedules : empData.mySchedules;
    return Array.isArray(list) ? list : [];
  }, [adminData.latestSchedules, empData.mySchedules, user?.role]);

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

    const pad2 = (n) => String(n).padStart(2, "0");
  const formatDDMMYYYY = (dateValue) => {
  const d = new Date(dateValue);
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
};

  return (
    <Layout>
      <Popup open={pop.open} type={pop.type} message={pop.message} onClose={() => setPop({ ...pop, open: false })} />

      <div className="vvDash-page">
        {/* fixed top bar */}
        <div className="vvDash-topbar">
          <div className="vvDash-title">Dashboard</div>
          <div className="vvDash-welcome">Welcome, {user?.name} !</div>
        </div>

        {user?.role === "admin" ? (
          <>
           
          </>
        ) : (
          <>
            {/* employee fixed cards */}
            <div className="vvDash-cards">
              <div className="vvDash-card">
                <div className="vvDash-cardLabel">Total Working Hours (This Week)</div>
                <div className="vvDash-cardValue">{empData.totalHours || "0.00"}</div>
              </div>
            </div>

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
              <div className="label">Employee Name</div>
              <div className="value">{u.name || "-"}</div>
            </div>
            <div className="field">
              <div className="label">Employee ID</div>
              <div className="value">{u.employeeId || "-"}</div>
            </div>
            <div className="field">
              <div className="label">Department</div>
              <div className="value">{u.department || "-"}</div>
            </div>
            <div className="field">
              <div className="label">Designation</div>
              <div className="value">{u.designation || "-"}</div>
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
                {formatDDMMYYYY(u.dob)}
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
          </>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;