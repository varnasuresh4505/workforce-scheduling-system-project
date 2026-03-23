import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
      <div className="flex h-full min-h-0 flex-col p-5 font-['Poppins',sans-serif]">
        <div className="mb-3 flex-none">
          <div className="mt-10 flex items-center justify-between gap-3">
            <h2 className="mt-7 text-[20px] font-extrabold text-slate-900">
              Shift Planner
            </h2>

            <div className="flex mt-5 items-center gap-[10px]">
              <button
                className="rounded-[10px] bg-slate-900 px-[14px] py-[9px] font-bold text-white transition duration-200 hover:-translate-y-[1px] hover:bg-slate-800"
                onClick={() => setWeekStart(addDays(weekStart, -7))}
                type="button"
              >
                Prev
              </button>
              <button
                className="rounded-[10px] bg-slate-900 px-[14px] py-[9px] font-bold text-white transition duration-200 hover:-translate-y-[1px] hover:bg-slate-800"
                onClick={() => setWeekStart(startOfWeek(new Date()))}
                type="button"
              >
                This Week
              </button>
              <button
                className="rounded-[10px] bg-slate-900 px-[14px] py-[9px] font-bold text-white transition duration-200 hover:-translate-y-[1px] hover:bg-slate-800"
                onClick={() => setWeekStart(addDays(weekStart, 7))}
                type="button"
              >
                Next
              </button>
            </div>
          </div>

          <div className="mb-4 mt-5 flex items-center gap-[10px] rounded-[14px] border border-gray-200 bg-white px-[14px] py-3 shadow-[0px_6px_18px_rgba(15,23,42,0.06)] focus-within:border-slate-900 focus-within:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]">
                  <FiSearch className="text-[18px] text-slate-500" />
                  <input
                    className="w-full border-none bg-transparent text-[14px] text-slate-900 outline-none"
                    placeholder="Search staff id / name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-[16px] border border-gray-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
          <div className="relative isolate h-full overflow-auto bg-slate-50 p-3 pb-[22px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="grid min-w-[1500px] grid-cols-[140px_240px_repeat(7,minmax(170px,1fr))] gap-[10px] items-stretch">
              <div className="sticky top-0 z-50 rounded-[12px] bg-slate-900 bg-clip-padding px-[10px] py-3 text-center text-[13px] font-extrabold text-white shadow-[0_10px_20px_rgba(15,23,42,0.18)]">
                Emp ID
              </div>
              <div className="sticky top-0 z-50 rounded-[12px] bg-slate-900 bg-clip-padding px-[10px] py-3 text-center text-[13px] font-extrabold text-white shadow-[0_10px_20px_rgba(15,23,42,0.18)]">
                Employee
              </div>

              {days.map((d) => (
                <div
                  key={ymd(d)}
                  className="sticky top-0 z-50 rounded-[12px] bg-slate-900 bg-clip-padding px-[10px] py-3 text-center text-[13px] font-extrabold text-white shadow-[0_10px_20px_rgba(15,23,42,0.18)]"
                >
                  {formatDayHeader(d)}
                </div>
              ))}

              {filteredEmployees.map((emp) => (
                <React.Fragment key={emp._id}>
                  <div className="relative z-[1] rounded-[14px] border border-gray-200 bg-white p-3 text-center font-bold text-slate-900 shadow-[0_10px_22px_rgba(15,23,42,0.06)]">
                    {emp.employeeId || "-"}
                  </div>

                  <div className="relative z-[1] rounded-[14px] border border-gray-200 bg-white p-3 font-bold text-slate-900 shadow-[0_10px_22px_rgba(15,23,42,0.06)]">
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
                        className="relative z-[1] flex min-h-[78px] cursor-pointer flex-col gap-2 rounded-[14px] border border-gray-200 bg-white p-3 shadow-[0_10px_22px_rgba(15,23,42,0.06)] transition duration-150 hover:-translate-y-[1px] hover:border-slate-300 hover:bg-gray-50"
                        title="Double click to add shift"
                        onDoubleClick={() => openModal(emp, d)}
                      >
                        {cellShifts.length === 0 ? (
                          <div className="select-none pt-2 text-center font-bold text-slate-400">
                            —
                          </div>
                        ) : (
                          cellShifts.map((s) => (
                            <div
                              key={s._id}
                              className="rounded-[12px] bg-slate-800 px-[10px] py-2 text-[12px] font-medium text-white shadow-[0_10px_18px_rgba(15,23,42,0.18)]"
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
                <div className="col-[1/-1] rounded-[12px] border border-gray-200 bg-white p-[18px] text-center text-slate-500">
                  No employees found
                </div>
              )}
            </div>
          </div>
        </div>

        {open && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/45">
            <div className="w-[380px] rounded-[16px] border border-gray-200 bg-white p-[18px] shadow-[0px_18px_50px_rgba(15,23,42,0.22)]">
              <h3 className="mb-[10px] mt-0 font-medium text-slate-900">
                Create Shift
              </h3>

              <p className="my-[6px] text-[14px] text-slate-700">
                <b>Employee:</b> {selectedEmp?.name} (
                {selectedEmp?.employeeId || "-"})
              </p>

              <p className="my-[6px] text-[14px] text-slate-700">
                <b>Date:</b> {selectedDate}
              </p>

              <div className="mt-3 flex gap-[10px]">
                <input
                  type="time"
                  className="h-[44px] flex-1 rounded-[10px] border border-slate-300 px-3 font-['Poppins',sans-serif] outline-none focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                />
                <input
                  type="time"
                  className="h-[44px] flex-1 rounded-[10px] border border-slate-300 px-3 font-['Poppins',sans-serif] outline-none focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm({ ...form, endTime: e.target.value })
                  }
                />
              </div>

              <div className="mt-[14px] flex gap-[10px]">
                <button
                  className="h-[44px] flex-1 rounded-[10px] bg-slate-900 font-medium text-white transition duration-200 hover:bg-slate-800"
                  onClick={createShift}
                  type="button"
                >
                  Save
                </button>
                <button
                  className="h-[44px] flex-1 rounded-[10px] bg-slate-400 font-medium text-white transition duration-200 hover:bg-slate-500"
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