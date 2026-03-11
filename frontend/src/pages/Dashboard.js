import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Popup from "../components/Popup";
import "./Dashboard.css";
import Schedules from "./Schedules";

const pad2 = (n) => String(n).padStart(2, "0");

const formatDDMMYYYY = (dateValue) => {
  if (!dateValue) return "-";
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

  if (Number.isNaN(h)) return t;

  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;

  return `${pad2(hour12)}:${m}${ampm}`;
};

const statusFromNow = (dateValue, fromTime, toTime) => {
  if (!dateValue || !fromTime || !toTime) return "inactive";

  const now = new Date();
  const d = new Date(dateValue);
  d.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (d.getTime() !== today.getTime()) {
    return d.getTime() > today.getTime() ? "inactive" : "completed";
  }

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

  const [pop, setPop] = useState({
    open: false,
    type: "success",
    message: "",
  });

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
    if (!user) {
      navigate("/");
      return;
    }

    loadDashboard();

    const onFocus = () => loadDashboard();
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line
  }, []);

  const loadDashboard = async () => {
    if (!user) return;

    if (user.role === "admin") {
      await fetchAdmin();
    } else {
      await fetchEmployee();
    }
  };

  const fetchAdmin = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setAdminData({
        totalEmployees: res.data?.totalEmployees || 0,
        todayPresent: res.data?.todayPresent || 0,
        todayShifts: res.data?.todayShifts || 0,
        latestSchedules: Array.isArray(res.data?.latestSchedules)
          ? res.data.latestSchedules
          : [],
      });
    } catch (err) {
      console.error(err);
      setPop({
        open: true,
        type: "error",
        message: "Failed to load admin dashboard",
      });
    }
  };

  const fetchEmployee = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/me", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setEmpData({
        user: res.data?.user || null,
        totalHours: res.data?.totalHours || "0.00",
        mySchedules: Array.isArray(res.data?.mySchedules)
          ? res.data.mySchedules
          : [],
      });
    } catch (err) {
      console.error(err);
      setPop({
        open: true,
        type: "error",
        message: "Failed to load employee dashboard",
      });
    }
  };

  const rows = useMemo(() => {
    const list =
      user?.role === "admin" ? adminData.latestSchedules : empData.mySchedules;
    return Array.isArray(list) ? list : [];
  }, [adminData.latestSchedules, empData.mySchedules, user?.role]);

  return (
    <Layout>
      <Popup
        open={pop.open}
        type={pop.type}
        message={pop.message}
        onClose={() => setPop({ ...pop, open: false })}
      />

      <div className="vvDash-page">
        {user?.role === "admin" ? (
          <>
            <Schedules />

            <div className="vvDash-cards">
              <div className="vvDash-card">
                <div className="vvDash-cardLabel">Total Employees</div>
                <div className="vvDash-cardValue">
                  {adminData.totalEmployees}
                </div>
              </div>

              <div className="vvDash-card">
                <div className="vvDash-cardLabel">Today Present</div>
                <div className="vvDash-cardValue">{adminData.todayPresent}</div>
              </div>

              <div className="vvDash-card">
                <div className="vvDash-cardLabel">Today Shifts</div>
                <div className="vvDash-cardValue">{adminData.todayShifts}</div>
              </div>
            </div>

            <div className="vvDash-tableWrap">
              <h2 className="emp-title">Latest Schedules</h2>

              <table className="vvDash-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Staff ID</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center" }}>
                        No schedules found
                      </td>
                    </tr>
                  ) : (
                    rows.map((item) => {
                      const fromTime = item.startTime || item.fromTime;
                      const toTime = item.endTime || item.toTime;
                      const employee = item.employee || item.user || {};

                      return (
                        <tr key={item._id}>
                          <td>{formatDDMMYYYY(item.date)}</td>
                          <td>{employee.name || "-"}</td>
                          <td>{employee.employeeId || "-"}</td>
                          <td>{formatAMPM(fromTime)}</td>
                          <td>{formatAMPM(toTime)}</td>
                          <td>
                            <span
                              className={`status-pill ${statusFromNow(
                                item.date,
                                fromTime,
                                toTime
                              )}`}
                            >
                              {statusFromNow(item.date, fromTime, toTime)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="vvDash-cards">
              <div className="vvDash-card">
                <div className="vvDash-cardLabel">
                  Total Working Hours (This Week)
                </div>
                <div className="vvDash-cardValue">
                  {empData.totalHours || "0.00"}
                </div>
              </div>
            </div>

            <div className="emp-page">
              <h2 className="emp-title">My Profile</h2>

              <div className="profile-card">
                <div className="profile-left">
                  <img
                    className="profile-img"
                    src={`/photos/${empData.user?.employeeId}.png`}
                    onError={(e) => (e.target.src = "/default-profile.png")}
                    alt="Profile"
                  />
                </div>

                <div className="profile-right">
                  <div className="profile-header">
                    <div className="profile-name">
                      {empData.user?.name || "-"}
                      <span className="status-dot" title="Active" />
                    </div>
                  </div>

                  <div className="profile-grid">
                    <div className="field">
                      <div className="label">Staff Name</div>
                      <div className="value">{empData.user?.name || "-"}</div>
                    </div>

                    <div className="field">
                      <div className="label">Staff ID</div>
                      <div className="value">
                        {empData.user?.employeeId || "-"}
                      </div>
                    </div>

                    <div className="field">
                      <div className="label">Department</div>
                      <div className="value">
                        {empData.user?.department || "-"}
                      </div>
                    </div>

                    <div className="field">
                      <div className="label">Designation</div>
                      <div className="value">
                        {empData.user?.designation || "-"}
                      </div>
                    </div>

                    <div className="field">
                      <div className="label">Email</div>
                      <div className="value">{empData.user?.email || "-"}</div>
                    </div>

                    <div className="field">
                      <div className="label">Mobile</div>
                      <div className="value">
                        {empData.user?.mobile || "-"}
                      </div>
                    </div>

                    <div className="field">
                      <div className="label">Gender</div>
                      <div className="value">
                        {empData.user?.gender || "-"}
                      </div>
                    </div>

                    <div className="field">
                      <div className="label">Date of Birth</div>
                      <div className="value">
                        {formatDDMMYYYY(empData.user?.dob)}
                      </div>
                    </div>

                    <div className="field">
                      <div className="label">Total Hours (This Week)</div>
                      <div className="value">
                        {empData.totalHours || "0.00"}
                      </div>
                    </div>

                    <div className="field full">
                      <div className="label">Address</div>
                      <div className="value">
                        {empData.user?.address || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="vvDash-tableWrap">
                <h2 className="emp-title">My Schedules</h2>

                <table className="vvDash-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center" }}>
                          No schedules found
                        </td>
                      </tr>
                    ) : (
                      rows.map((item) => {
                        const fromTime = item.startTime || item.fromTime;
                        const toTime = item.endTime || item.toTime;

                        return (
                          <tr key={item._id}>
                            <td>{formatDDMMYYYY(item.date)}</td>
                            <td>{formatAMPM(fromTime)}</td>
                            <td>{formatAMPM(toTime)}</td>
                            <td>
                              <span
                                className={`status-pill ${statusFromNow(
                                  item.date,
                                  fromTime,
                                  toTime
                                )}`}
                              >
                                {statusFromNow(item.date, fromTime, toTime)}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;