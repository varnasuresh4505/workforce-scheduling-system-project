import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

const getStatusClass = (status) => {
  if (status === "active") return "bg-green-100 text-green-700";
  if (status === "completed") return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
};

function Schedules() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", msg: "" });

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
    setTimeout(() => {
      setToast({ show: false, type: "success", msg: "" });
    }, 2500);
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast("error", "Failed to fetch employees");
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/schedules", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSchedules(Array.isArray(res.data) ? res.data : []);
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
        // ignore leave stats error
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

  const tableRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return schedules
      .map((s) => {
        const fromTime = s.fromTime || s.startTime;
        const toTime = s.toTime || s.endTime;
        const status = getShiftStatus(s.date, fromTime, toTime);
        return { ...s, fromTime, toTime, status };
      })
      .filter((s) => {
        if (!q) return true;

        const haystack = [
          s.employee?.employeeId,
          s.employeeId,
          s.employee?.name,
          s.employeeName,
          s.department,
          s.designation,
          s.employeeEmail,
          s.email,
          s.status,
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
    <div className="min-h-screen bg-slate-100 p-[26px] font-['Poppins',sans-serif]">
      <div className="sticky top-0 z-40 bg-slate-100 pb-[14px] pt-[2px]">
        <div className="mb-3 flex items-center justify-between">
          <div className="m-0 text-[20px] font-extrabold text-slate-900">
            Schedules
          </div>

          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-[0px_6px_18px_rgba(15,23,42,0.06)]">
            <span className="text-[13px] font-bold text-slate-900">
              Welcome, {user?.name} !
            </span>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-[14px] border border-gray-200 bg-white p-[14px] shadow-[0px_6px_18px_rgba(15,23,42,0.06)]">
            <div className="text-[14px] font-extrabold text-slate-500">
              Total Employees
            </div>
            <div className="mt-[6px] text-[22px] font-bold text-slate-900">
              {stats.totalEmployees}
            </div>
          </div>

          <div className="rounded-[14px] border border-gray-200 bg-white p-[14px] shadow-[0px_6px_18px_rgba(15,23,42,0.06)]">
            <div className="text-[14px] font-extrabold text-slate-500">
              Today Present
            </div>
            <div className="mt-[6px] text-[22px] font-bold text-slate-900">
              {stats.todayPresent}
            </div>
          </div>

          <div className="rounded-[14px] border border-gray-200 bg-white p-[14px] shadow-[0px_6px_18px_rgba(15,23,42,0.06)]">
            <div className="text-[14px] font-extrabold text-slate-500">
              Today Shifts
            </div>
            <div className="mt-[6px] text-[22px] font-bold text-slate-900">
              {stats.todayShifts}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="inline-flex h-[44px] items-center gap-2 rounded-[12px] bg-slate-900 px-4 font-semibold text-white transition duration-200 hover:-translate-y-[1px] hover:bg-slate-800"
            onClick={openModal}
            type="button"
          >
            <FiPlus />
            Create Schedule
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-[10px] rounded-[14px] border border-gray-200 bg-white px-[14px] py-3 shadow-[0px_6px_18px_rgba(15,23,42,0.06)] focus-within:border-slate-900 focus-within:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]">
        <FiSearch className="text-[18px] text-slate-500" />
        <input
          className="w-full border-none bg-transparent text-[14px] text-slate-900 outline-none"
          placeholder="Search staff id / name / dept / designation / email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-[14px] border border-gray-200 bg-white p-[18px] shadow-[0px_6px_18px_rgba(15,23,42,0.06)]">
        <div className="mb-[10px] flex items-center justify-between">
          <h3 className="m-0 text-[16px] font-semibold text-slate-900">
            Schedule List
          </h3>

          <span className="rounded-full bg-slate-100 px-[10px] py-[6px] text-[12px] text-slate-500">
            {tableRows.length} Records
          </span>
        </div>

        <div className="max-h-[320px] overflow-y-auto rounded-[12px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                  Staff ID
                </th>
                <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                  Name
                </th>
                <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                  Department
                </th>
                <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                  Designation
                </th>
                <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                  Date
                </th>
                <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                  Time
                </th>
                <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {tableRows.map((s, index) => (
                <tr key={s._id}>
                  <td
                    className={`border border-gray-200 px-3 py-3 text-[15px] text-slate-900 ${
                      index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                    }`}
                  >
                    {s.employee?.employeeId || s.employeeId || "-"}
                  </td>

                  <td
                    className={`border border-gray-200 px-3 py-3 text-[15px] text-slate-900 ${
                      index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                    }`}
                  >
                    {s.employee?.name || s.employeeName || "-"}
                  </td>

                  <td
                    className={`border border-gray-200 px-3 py-3 text-[15px] text-slate-900 ${
                      index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                    }`}
                  >
                    {s.department || "-"}
                  </td>

                  <td
                    className={`border border-gray-200 px-3 py-3 text-[15px] text-slate-900 ${
                      index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                    }`}
                  >
                    {s.designation || "-"}
                  </td>

                  <td
                    className={`border border-gray-200 px-3 py-3 text-[15px] text-slate-900 ${
                      index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                    }`}
                  >
                    {formatDateDDMMYYYY(s.date)}
                  </td>

                  <td
                    className={`border border-gray-200 px-3 py-3 text-[15px] text-slate-900 ${
                      index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                    }`}
                  >
                    {formatTimeAMPM(s.fromTime)} - {formatTimeAMPM(s.toTime)}
                  </td>

                  <td
                    className={`border border-gray-200 px-3 py-3 text-[15px] text-slate-900 ${
                      index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                    }`}
                  >
                    <span
                      className={`inline-block rounded-full px-[10px] py-[6px] text-[12px] font-bold capitalize ${getStatusClass(
                        s.status
                      )}`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}

              {tableRows.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-[18px] py-[18px] text-center text-slate-500"
                  >
                    No schedules found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45">
          <div className="w-[680px] max-w-[92vw] rounded-[16px] border border-gray-200 bg-white p-[18px] shadow-[0px_20px_60px_rgba(15,23,42,0.2)]">
            <div className="flex items-center justify-between">
              <h3 className="text-[20px] font-semibold text-slate-900">
                Create Schedule
              </h3>
              <button
                className="grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-gray-200 bg-slate-50 text-[18px] transition hover:bg-indigo-50"
                onClick={() => setOpen(false)}
                type="button"
              >
                <FiX />
              </button>
            </div>

            <form
              className="mt-[14px] grid grid-cols-1 gap-3 md:grid-cols-2"
              onSubmit={createSchedule}
            >
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-slate-600">
                  Staff ID
                </label>
                <select
                  className="h-[44px] rounded-[12px] border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]"
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

              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-slate-600">
                  Name
                </label>
                <input
                  className="h-[44px] rounded-[12px] border border-slate-300 bg-white px-3 text-slate-900 outline-none"
                  value={form.employeeName}
                  readOnly
                  placeholder="Name"
                />
              </div>

              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-slate-600">
                  Department
                </label>
                <input
                  className="h-[44px] rounded-[12px] border border-slate-300 bg-white px-3 text-slate-900 outline-none"
                  value={form.department}
                  readOnly
                  placeholder="Department"
                />
              </div>

              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-slate-600">
                  Designation
                </label>
                <input
                  className="h-[44px] rounded-[12px] border border-slate-300 bg-white px-3 text-slate-900 outline-none"
                  value={form.designation}
                  readOnly
                  placeholder="Designation"
                />
              </div>

              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-slate-600">
                  Date
                </label>
                <input
                  type="date"
                  className="h-[44px] rounded-[12px] border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-slate-600">
                  From
                </label>
                <input
                  type="time"
                  className="h-[44px] rounded-[12px] border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]"
                  value={form.fromTime}
                  onChange={(e) =>
                    setForm({ ...form, fromTime: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-slate-600">
                  To
                </label>
                <input
                  type="time"
                  className="h-[44px] rounded-[12px] border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]"
                  value={form.toTime}
                  onChange={(e) =>
                    setForm({ ...form, toTime: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-span-1 mt-[6px] flex justify-end gap-[10px] md:col-span-2">
                <button
                  className="h-[44px] rounded-[12px] bg-slate-900 px-[18px] font-semibold text-white transition hover:bg-slate-800"
                  type="submit"
                >
                  Save Schedule
                </button>
                <button
                  className="h-[44px] rounded-[12px] bg-slate-400 px-[18px] font-semibold text-white transition hover:bg-slate-500"
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

      {toast.show && (
        <div
          className={`fixed bottom-[18px] right-[18px] z-[2000] flex items-center gap-[10px] rounded-[14px] px-[14px] py-3 font-semibold shadow-[0px_12px_30px_rgba(15,23,42,0.2)] ${
            toast.type === "success"
              ? "border border-green-200 bg-green-100 text-green-700"
              : "border border-red-200 bg-red-100 text-red-700"
          }`}
        >
          {toast.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

export default Schedules;