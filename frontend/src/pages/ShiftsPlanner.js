import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ShiftsPlanner.css";
import Layout from "../components/Layout";
import { FiSearch } from "react-icons/fi";

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
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
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

function ShiftsPlanner() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const [form, setForm] = useState({
    startTime: "09:00",
    endTime: "17:00",
  });

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchEmployees();
    fetchShifts();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchShifts();
    }
    // eslint-disable-next-line
  }, [weekStart]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch employees");
    }
  };

  const fetchShifts = async () => {
    try {
      // corrected endpoint
      const res = await axios.get("http://localhost:5000/api/schedules", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setShifts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setShifts([]);
    }
  };

  const openModal = (emp, date) => {
    setSelectedEmp(emp);
    setSelectedDate(ymd(date));
    setForm({ startTime: "09:00", endTime: "17:00" });
    setOpen(true);
  };

  const createShift = async () => {
    if (!selectedEmp?.employeeId || !selectedDate) return;

    try {
      await axios.post(
        "http://localhost:5000/api/schedules",
        {
          employeeId: selectedEmp.employeeId,
          date: selectedDate,
          fromTime: form.startTime,
          toTime: form.endTime,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setOpen(false);
      await fetchShifts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating schedule");
    }
  };

  const formatDayHeader = (d) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    return d.toLocaleDateString(undefined, options);
  };

  const formatTime = (time) => {
    if (!time) return "-";
    const t = String(time).trim();

    if (/am|pm/i.test(t)) {
      return t
        .replace(/\s+/g, " ")
        .replace(/am/i, "AM")
        .replace(/pm/i, "PM");
    }

    const parts = t.split(":");
    if (parts.length < 2) return t;

    const h = parseInt(parts[0], 10);
    const m = parts[1];
    if (Number.isNaN(h)) return t;

    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;

    return `${hour12}:${m} ${ampm}`;
  };

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;

    return employees.filter((emp) => {
      const hay = [
        emp.employeeId,
        emp.name,
        emp.department,
        emp.designation,
        emp.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [employees, search]);

  return (
    <Layout>
      <div className="planner-page">
        <div className="planner-fixedTop">
          <div className="planner-topRow">
            <h2 className="planner-title">Shift Planner</h2>

            <div className="week-controls">
              <button onClick={() => setWeekStart(addDays(weekStart, -7))}>
                Prev
              </button>
              <button onClick={() => setWeekStart(startOfWeek(new Date()))}>
                This Week
              </button>
              <button onClick={() => setWeekStart(addDays(weekStart, 7))}>
                Next
              </button>
            </div>
          </div>

          <div className="planner-searchRow">
            <FiSearch className="planner-searchIcon" />
            <input
              className="planner-searchInput"
              placeholder="Search staff id / name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="planner-board">
          <div className="planner-scroll">
            <div className="planner-grid">
              <div className="header-cell sticky-top">Emp ID</div>
              <div className="header-cell sticky-top">Employee</div>

              {days.map((d) => (
                <div key={ymd(d)} className="header-cell sticky-top">
                  {formatDayHeader(d)}
                </div>
              ))}

              {filteredEmployees.map((emp) => (
                <React.Fragment key={emp._id}>
                  <div className="empid-cell">{emp.employeeId || "-"}</div>
                  <div className="emp-cell">{emp.name}</div>

                  {days.map((d) => {
                    const dayKey = ymd(d);

                    const cellShifts = shifts.filter((s) => {
                      const shiftEmpId =
                        s.employee?._id ||
                        s.employee ||
                        s.employeeId?._id ||
                        s.employeeId;

                      const sameEmp =
                        String(shiftEmpId) === String(emp._id) ||
                        String(shiftEmpId) === String(emp.employeeId);

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
                        {cellShifts.length === 0 ? (
                          <div className="empty-slot">—</div>
                        ) : (
                          cellShifts.map((s) => (
                            <div key={s._id} className="shift-box">
                              {formatTime(s.startTime || s.fromTime)} -{" "}
                              {formatTime(s.endTime || s.toTime)}
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}

              {filteredEmployees.length === 0 && (
                <div className="planner-empty">No employees found</div>
              )}
            </div>
          </div>
        </div>

        {open && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Create Shift</h3>
              <p>
                <b>Employee:</b> {selectedEmp?.name} (
                {selectedEmp?.employeeId || "-"})
              </p>
              <p>
                <b>Date:</b> {selectedDate}
              </p>

              <div className="modal-time">
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                />
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm({ ...form, endTime: e.target.value })
                  }
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