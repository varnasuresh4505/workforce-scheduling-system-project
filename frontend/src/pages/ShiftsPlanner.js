import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ShiftsPlanner.css";
import Layout from "../components/Layout";

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const ymd = (date) => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

function ShiftsPlanner() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [open, setOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const [form, setForm] = useState({
    startTime: "09:00",
    endTime: "17:00",
  });

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  useEffect(() => {
    if (!user) return navigate("/");
    if (user.role !== "admin") return navigate("/dashboard");

    fetchEmployees();
    fetchShifts();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchShifts();
    // eslint-disable-next-line
  }, [weekStart]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch employees");
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/shifts", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setShifts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (emp, date) => {
    setSelectedEmp(emp);
    setSelectedDate(ymd(date));
    setForm({ startTime: "09:00", endTime: "17:00" });
    setOpen(true);
  };

  const createShift = async () => {
    if (!selectedEmp?._id || !selectedDate) return;

    try {
      await axios.post(
        "http://localhost:5000/api/shifts",
        {
          employeeId: selectedEmp._id, // backend expects employee objectId
          date: selectedDate,
          startTime: form.startTime,
          endTime: form.endTime,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      alert("Shift created ✅");
      setOpen(false);
      fetchShifts();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating shift");
    }
  };

  const formatDayHeader = (d) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    return d.toLocaleDateString(undefined, options);
  };

  const formatTime = (time) => {
  if (!time) return "-";

  const t = String(time).trim();

  // If backend already sent AM/PM, just normalize the casing and spacing
  if (/am|pm/i.test(t)) {
    return t
      .replace(/\s+/g, " ")
      .replace(/am/i, "AM")
      .replace(/pm/i, "PM");
  }

  // Accept "HH:mm" or "HH:mm:ss"
  const parts = t.split(":");
  if (parts.length < 2) return t;

  const h = parseInt(parts[0], 10);
  const m = parts[1];

  if (Number.isNaN(h)) return t;

  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;

  return `${hour12}:${m} ${ampm}`;
};

  return (
    <Layout>
      <div className="planner-page">
        <div className="planner-top">
          <h2>Shift Planner</h2>

          <div className="week-controls">
            <button onClick={() => setWeekStart(addDays(weekStart, -7))}>Prev</button>
            <button onClick={() => setWeekStart(startOfWeek(new Date()))}>This Week</button>
            <button onClick={() => setWeekStart(addDays(weekStart, 7))}>Next</button>
          </div>
        </div>

        <div className="planner-grid">
          {/* ✅ Header row (9 columns exactly) */}
          <div className="header-cell">Emp ID</div>
          <div className="header-cell">Employee</div>

          {days.map((d) => (
            <div key={ymd(d)} className="header-cell">
              {formatDayHeader(d)}
            </div>
          ))}

          {/* ✅ Body rows (9 columns per employee) */}
          {employees.map((emp) => (
            <React.Fragment key={emp._id}>
              <div className="empid-cell">{emp.employeeId || "-"}</div>
              <div className="emp-cell">{emp.name}</div>

              {days.map((d) => {
                const dayKey = ymd(d);

                const cellShifts = shifts.filter((s) => {
                  const shiftEmpId = s.employee?._id || s.employee; // supports both populated/unpopulated
                  const sameEmp = String(shiftEmpId) === String(emp._id);
                  const sameDay = ymd(s.date) === dayKey;
                  return sameEmp && sameDay;
                });

                return (
                  <div
                    key={`${emp._id}_${dayKey}`}
                    className="day-cell"
                    title="Double click to add shift"
                    onDoubleClick={() => openModal(emp, d)}
                  >
                    {cellShifts.map((s) => (
                      <div key={s._id} className="shift-box">
                        {formatTime(s.startTime)} - {formatTime(s.endTime)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Modal */}
        {open && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Create Shift</h3>
              <p>
                <b>Employee:</b> {selectedEmp?.name} ({selectedEmp?.employeeId || "-"})
              </p>
              <p>
                <b>Date:</b> {selectedDate}
              </p>

              <div className="modal-time">
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button onClick={createShift}>Save</button>
                <button onClick={() => setOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ShiftsPlanner;