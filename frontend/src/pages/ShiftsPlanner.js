import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ShiftsPlanner.css";

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

  // ✅ IMPORTANT: refresh shifts when week changes
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
      // don't alert every time when switching weeks, keep it silent
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
          employeeId: selectedEmp._id, // ✅ objectId expected in shiftController
          date: selectedDate,          // ✅ string ok; backend converts to Date
          startTime: form.startTime,
          endTime: form.endTime,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      alert("Shift created");
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>Shift Planner</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
        <button onClick={() => setWeekStart(addDays(weekStart, -7))}>Prev</button>
        <button onClick={() => setWeekStart(startOfWeek(new Date()))}>This Week</button>
        <button onClick={() => setWeekStart(addDays(weekStart, 7))}>Next</button>
      </div>

      <div className="planner-grid">
        <div className="header-cell">Employees</div>

        {days.map((d) => (
          <div key={ymd(d)} className="header-cell">
            {formatDayHeader(d)}
          </div>
        ))}

        {employees.map((emp) => (
          <React.Fragment key={emp._id}>
            <div className="emp-cell">{emp.name}</div>

            {days.map((d) => {
              const cellShifts = shifts.filter((s) => {
                const sameEmp = s.employee?._id === emp._id;
                const sameDay = new Date(s.date).toDateString() === d.toDateString();
                return sameEmp && sameDay;
              });

              return (
                <div
                  key={emp._id + ymd(d)}
                  className="day-cell"
                  title="Double click to add shift"
                  onDoubleClick={() => openModal(emp, d)}
                >
                  {cellShifts.map((s) => (
                    <div key={s._id} className="shift-box">
                      {s.startTime} - {s.endTime}
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {open && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create Shift</h3>
            <p><b>Employee:</b> {selectedEmp?.name}</p>
            <p><b>Date:</b> {selectedDate}</p>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
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

            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={createShift}>Save</button>
              <button onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShiftsPlanner;