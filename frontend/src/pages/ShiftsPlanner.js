import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Popup from "../components/Popup";
import { API_BASE_URL } from "../services/api";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";

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
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const [form, setForm] = useState({
    startTime: "09:00",
    endTime: "17:00",
  });

  const [pop, setPop] = useState({
    open: false,
    type: "success",
    message: "",
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
    fetchLeaves();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchShifts();
      fetchLeaves();
    }
    // eslint-disable-next-line
  }, [weekStart]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/employees`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: "Failed to fetch employees",
      });
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/schedules`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setShifts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setShifts([]);
      setPop({
        open: true,
        type: "error",
        message: "Failed to fetch shifts",
      });
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/leaves`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setLeaves([]);
    }
  };

  const openModal = (emp, date) => {
    setSelectedEmp(emp);
    setSelectedDate(ymd(date));
    setForm({ startTime: "09:00", endTime: "17:00" });
    setOpen(true);
  };

  const hasLeaveConflict = () => {
    if (!selectedEmp || !selectedDate) return false;

    const shiftStart = new Date(`${selectedDate}T${form.startTime}`);
    const shiftEnd = new Date(`${selectedDate}T${form.endTime}`);

    if (shiftEnd <= shiftStart) {
      return "Shift end time must be greater than start time";
    }

    const approvedLeaves = leaves.filter((lv) => {
      const status = String(lv.status || "").toLowerCase();
      if (status !== "approved") return false;

      const leaveEmpId =
        lv.employee?.employeeId ||
        lv.employeeId ||
        lv.employee?._id ||
        lv.employee;

      return (
        String(leaveEmpId) === String(selectedEmp.employeeId) ||
        String(leaveEmpId) === String(selectedEmp._id)
      );
    });

    for (const leave of approvedLeaves) {
      const leaveStart = new Date(
        `${ymd(leave.fromDate)}T${leave.startTime || "00:00"}`
      );
      const leaveEnd = new Date(
        `${ymd(leave.toDate)}T${leave.endTime || "23:59"}`
      );

      if (shiftStart < leaveEnd && shiftEnd > leaveStart) {
        return "Employee is on approved leave during this time";
      }
    }

    return false;
  };

  const createShift = async () => {
    if (!selectedEmp?.employeeId || !selectedDate) return;

    const leaveConflictMessage = hasLeaveConflict();
    if (leaveConflictMessage) {
      setPop({
        open: true,
        type: "error",
        message: leaveConflictMessage,
      });
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/schedules`,
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

      setPop({
        open: true,
        type: "success",
        message: "Shift created successfully",
      });
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: err.response?.data?.message || "Error creating schedule",
      });
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
      <Popup
        open={pop.open}
        type={pop.type}
        message={pop.message}
        onClose={() => setPop({ ...pop, open: false })}
      />

      <div className="min-h-screen bg-slate-50 p-4 font-['Poppins',sans-serif]">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[20px] font-bold text-slate-900">
              Shift Planner
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Double click a cell to assign a shift
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-[38px] items-center gap-1 rounded-[10px] border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              type="button"
            >
              <FiChevronLeft />
              Prev
            </button>

            <button
              className="h-[38px] rounded-[10px] bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              type="button"
            >
              This Week
            </button>

            <button
              className="inline-flex h-[38px] items-center gap-1 rounded-[10px] border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              onClick={() => setWeekStart(addDays(weekStart, 7))}
              type="button"
            >
              Next
              <FiChevronRight />
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-[10px] rounded-[12px] border border-slate-200 bg-white px-[14px] py-2.5 shadow-sm">
          <FiSearch className="text-[16px] text-slate-500" />
          <input
            className="w-full border-none bg-transparent text-[14px] text-slate-900 outline-none"
            placeholder="Search staff id / name / department"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="grid min-w-[1450px] grid-cols-[120px_220px_repeat(7,minmax(160px,1fr))] gap-[8px] bg-slate-100 p-3">
              <div className="sticky top-0 z-30 rounded-[10px] bg-slate-900 px-3 py-2.5 text-center text-[12px] font-semibold text-white">
                Emp ID
              </div>

              <div className="sticky top-0 z-30 rounded-[10px] bg-slate-900 px-3 py-2.5 text-center text-[12px] font-semibold text-white">
                Employee
              </div>

              {days.map((d) => (
                <div
                  key={ymd(d)}
                  className="sticky top-0 z-30 rounded-[10px] bg-slate-900 px-3 py-2.5 text-center text-[12px] font-semibold text-white"
                >
                  {formatDayHeader(d)}
                </div>
              ))}

              {filteredEmployees.map((emp) => (
                <React.Fragment key={emp._id}>
                  <div className="rounded-[10px] border border-slate-200 bg-white px-3 py-3 text-center text-[13px] font-semibold text-slate-900">
                    {emp.employeeId || "-"}
                  </div>

                  <div className="rounded-[10px] border border-slate-200 bg-white px-3 py-3 text-[13px] font-semibold text-slate-900">
                    {emp.name}
                  </div>

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
                        className="flex min-h-[72px] cursor-pointer flex-col gap-1 rounded-[10px] border border-slate-200 bg-white p-2.5 transition hover:border-slate-300 hover:bg-slate-50"
                        title="Double click to add shift"
                        onDoubleClick={() => openModal(emp, d)}
                      >
                        {cellShifts.length === 0 ? (
                          <div className="flex flex-1 items-center justify-center text-[18px] font-semibold text-slate-300">
                            —
                          </div>
                        ) : (
                          cellShifts.map((s) => (
                            <div
                              key={s._id}
                              className="rounded-[8px] bg-slate-900 px-2 py-1.5 text-[11px] font-medium text-white"
                            >
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
                <div className="col-[1/-1] rounded-[10px] border border-slate-200 bg-white p-4 text-center text-sm text-slate-500">
                  No employees found
                </div>
              )}
            </div>
          </div>
        </div>

        {open && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/45 px-4">
            <div className="w-[380px] rounded-[16px] border border-slate-200 bg-white p-[18px] shadow-[0px_18px_50px_rgba(15,23,42,0.22)]">
              <h3 className="mb-[10px] mt-0 text-[18px] font-semibold text-slate-900">
                Create Shift
              </h3>

              <p className="my-[6px] text-[13px] text-slate-700">
                <b>Employee:</b> {selectedEmp?.name} (
                {selectedEmp?.employeeId || "-"})
              </p>

              <p className="my-[6px] text-[13px] text-slate-700">
                <b>Date:</b> {selectedDate}
              </p>

              <div className="mt-3 flex gap-[10px]">
                <input
                  type="time"
                  className="h-[42px] flex-1 rounded-[10px] border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                />
                <input
                  type="time"
                  className="h-[42px] flex-1 rounded-[10px] border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm({ ...form, endTime: e.target.value })
                  }
                />
              </div>

              <div className="mt-[14px] flex gap-[10px]">
                <button
                  className="h-[42px] flex-1 rounded-[10px] bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800"
                  onClick={createShift}
                  type="button"
                >
                  Save
                </button>
                <button
                  className="h-[42px] flex-1 rounded-[10px] bg-slate-300 text-sm font-medium text-slate-800 transition hover:bg-slate-400"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ShiftsPlanner;
