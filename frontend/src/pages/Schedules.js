import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "./Schedules.css";
import {
  FiPlus,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
} from "react-icons/fi";

const formatDateDDMMYYYY = (dateStr) => {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const formatTimeAMPM = (time) => {
  if (!time) return "-";
  const [h, m] = String(time).split(":");
  const hh = parseInt(h, 10);
  const ampm = hh >= 12 ? "PM" : "AM";
  const hour12 = hh % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${m} ${ampm}`;
};

const getShiftStatus = (dateStr, fromTime, toTime) => {
  try {
    const now = new Date();

    const d = new Date(dateStr);
    const [fh, fm] = fromTime.split(":").map(Number);
    const [th, tm] = toTime.split(":").map(Number);

    const start = new Date(d);
    start.setHours(fh, fm, 0, 0);

    const end = new Date(d);
    end.setHours(th, tm, 0, 0);

    if (now >= start && now <= end) return "active";
    if (now > end) return "completed";
    return "inactive";
  } catch {
    return "inactive";
  }
};

function Schedules() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [search, setSearch] = useState("");

  // modal
  const [open, setOpen] = useState(false);

  // toast
  const [toast, setToast] = useState({ show: false, type: "success", msg: "" });

  // top stats
  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayPresent: 0,
    todayShifts: 0,
  });

  const [form, setForm] = useState({
    employeeId: "",
    employeeName: "",
    department: "",
    designation: "",
    date: "",
    fromTime: "09:00",
    toTime: "17:00",
  });

  useEffect(() => {
    if (!user) return navigate("/");
    if (user.role !== "admin") return navigate("/dashboard");

    fetchEmployees();
    fetchSchedules();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    computeStats();
    // eslint-disable-next-line
  }, [employees, schedules]);

  const showToast = (type, msg) => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast({ show: false, type: "success", msg: "" }), 2500);
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEmployees(res.data);
    } catch (err) {
      showToast("error", "Failed to fetch employees");
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/schedules", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSchedules(res.data);
    } catch (err) {
      showToast("error", "Failed to fetch schedules");
    }
  };

  const computeStats = async () => {
    try {
      const totalEmployees = employees.length;

      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");
      const todayKey = `${y}-${m}-${d}`;

      const todaySchedules = schedules.filter((s) => {
        const sd = new Date(s.date);
        const yy = sd.getFullYear();
        const mm = String(sd.getMonth() + 1).padStart(2, "0");
        const dd = String(sd.getDate()).padStart(2, "0");
        return `${yy}-${mm}-${dd}` === todayKey;
      });

      const todayShifts = todaySchedules.length;

      let todayPresent = totalEmployees;

      try {
        const leavesRes = await axios.get("http://localhost:5000/api/leaves", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const leaves = leavesRes.data || [];

        const approvedToday = leaves.filter((lv) => {
          const status = String(lv.status || "").toLowerCase();
          if (status !== "approved") return false;

          const from = new Date(lv.fromDate);
          const to = new Date(lv.toDate);

          from.setHours(0, 0, 0, 0);
          to.setHours(23, 59, 59, 999);

          const t = new Date(today);
          t.setHours(12, 0, 0, 0);

          return t >= from && t <= to;
        });

        const leaveEmpSet = new Set(
          approvedToday
            .map((lv) => lv.employee?._id || lv.employee)
            .filter(Boolean)
            .map(String)
        );

        todayPresent = Math.max(0, totalEmployees - leaveEmpSet.size);
      } catch {
        // ignore
      }

      setStats({ totalEmployees, todayPresent, todayShifts });
    } catch {
      // ignore
    }
  };

  const handleEmpIdChange = (value) => {
    const emp = employees.find((e) => e.employeeId === value);

    setForm((prev) => ({
      ...prev,
      employeeId: value,
      employeeName: emp?.name || "",
      department: emp?.department || "",
      designation: emp?.designation || "",
    }));
  };

  const openModal = () => {
    setForm({
      employeeId: "",
      employeeName: "",
      department: "",
      designation: "",
      date: "",
      fromTime: "09:00",
      toTime: "17:00",
    });
    setOpen(true);
  };

  const createSchedule = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/schedules",
        {
          employeeId: form.employeeId,
          date: form.date,
          fromTime: form.fromTime,
          toTime: form.toTime,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setOpen(false);
      showToast("success", "Schedule created successfully ✅");
      fetchSchedules();
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || "Failed to create schedule"
      );
    }
  };

  // ✅ UPDATED: add search filter + status mapping
  const tableRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return schedules
      .map((s) => {
        const status = getShiftStatus(s.date, s.fromTime, s.toTime);
        return { ...s, status };
      })
      .filter((s) => {
        if (!q) return true;

        const haystack = [
          s.employeeId,
          s.employeeName,
          s.department,
          s.designation,
          s.employeeEmail, // if backend sends
          s.email, // if backend sends
          s.status, // active/completed/inactive
          formatDateDDMMYYYY(s.date),
          `${s.fromTime}-${s.toTime}`,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(q);
      });
  }, [schedules, search]);

  return (
    <Layout>
      <div className="vvSched-page">
        {/* ✅ TOP FIXED HEADER AREA */}
        <div className="vvSched-fixedTop">
          {/* Welcome */}
          <div className="vvSched-welcomeRow">
            <div className="vvSched-welcomeTitle">Schedules</div>
            <div className="vvSched-welcomeRight">
              
              <span className="vvSched-welcomeName">Welcome, {user?.name} !</span>
            </div>
          </div>

          {/* Cards */}
          <div className="vvSched-cards">
            <div className="vvSched-cardMini">
              <div className="vvSched-cardLabel">Total Employees</div>
              <div className="vvSched-cardValue">{stats.totalEmployees}</div>
            </div>

            <div className="vvSched-cardMini">
              <div className="vvSched-cardLabel">Today Present</div>
              <div className="vvSched-cardValue">{stats.todayPresent}</div>
            </div>

            <div className="vvSched-cardMini">
              <div className="vvSched-cardLabel">Today Shifts</div>
              <div className="vvSched-cardValue">{stats.todayShifts}</div>
            </div>
          </div>

          {/* Create Button */}
          <div className="vvSched-actionsRow">
            <button className="vvSched-addBtn" onClick={openModal} type="button">
              <FiPlus /> Create Schedule
            </button>
          </div>
        </div>

        {/* ✅ SEARCH */}
        <div className="vvEmp-searchRow">
          <FiSearch className="vvEmp-searchIcon" />
          <input
            className="vvEmp-searchInput"
            placeholder="Search staff id / name / dept / designation / email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ✅ TABLE CARD */}
        <div className="vvSched-card">
          <div className="vvSched-cardHead">
            <h3 className="vvSched-cardTitle">Schedule List</h3>

            {/* ✅ UPDATED: show filtered count */}
            <span className="vvSched-badge">{tableRows.length} Records</span>
          </div>

          <div className="vvSched-tableWrap">
            <table className="vvSched-table">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {tableRows.map((s) => (
                  <tr key={s._id}>
                    <td>{s.employee?.employeeId || s.employeeId}</td>
                    <td>{s.employee?.name || s.employeeName}</td>
                    <td>{s.department || "-"}</td>
                    <td>{s.designation || "-"}</td>
                    <td>{formatDateDDMMYYYY(s.date)}</td>
                    <td>
                      {formatTimeAMPM(s.fromTime)} - {formatTimeAMPM(s.toTime)}
                    </td>
                    <td>
                      <span className={`vvSched-status ${s.status}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {tableRows.length === 0 && (
                  <tr>
                    <td colSpan="7" className="vvSched-empty">
                      No schedules found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ MODAL */}
        {open && (
          <div className="vvSched-modalOverlay">
            <div className="vvSched-modal">
              <div className="vvSched-modalHead">
                <h3>Create Schedule</h3>
                <button
                  className="vvSched-closeBtn"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <FiX />
                </button>
              </div>

              <form className="vvSched-modalGrid" onSubmit={createSchedule}>
                <div className="vvSched-field">
                  <label>Staff ID</label>
                  <select
                    value={form.employeeId}
                    onChange={(e) => handleEmpIdChange(e.target.value)}
                    required
                  >
                    <option value="">Select Staff</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp.employeeId}>
                        {emp.employeeId} - {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="vvSched-field">
                  <label>Name</label>
                  <input value={form.employeeName} readOnly placeholder="Name" />
                </div>

                <div className="vvSched-field">
                  <label>Department</label>
                  <input
                    value={form.department}
                    readOnly
                    placeholder="Department"
                  />
                </div>

                <div className="vvSched-field">
                  <label>Designation</label>
                  <input
                    value={form.designation}
                    readOnly
                    placeholder="Designation"
                  />
                </div>

                <div className="vvSched-field">
                  <label>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>

                <div className="vvSched-field">
                  <label>From</label>
                  <input
                    type="time"
                    value={form.fromTime}
                    onChange={(e) =>
                      setForm({ ...form, fromTime: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="vvSched-field">
                  <label>To</label>
                  <input
                    type="time"
                    value={form.toTime}
                    onChange={(e) =>
                      setForm({ ...form, toTime: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="vvSched-actions">
                  <button className="vvSched-saveBtn" type="submit">
                    Save Schedule
                  </button>
                  <button
                    className="vvSched-cancelBtn"
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ✅ TOAST */}
        {toast.show && (
          <div className={`vvToast ${toast.type}`}>
            {toast.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{toast.msg}</span>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Schedules;