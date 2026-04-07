import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Popup from "../components/Popup";
import { API_BASE_URL } from "../services/api";
import {
  FiPlus,
  FiX,
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
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const [pop, setPop] = useState({
    open: false,
    type: "success",
    message: "",
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
    fetchLeaves();
    // eslint-disable-next-line
  }, []);

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

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/schedules`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSchedules(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: "Failed to fetch schedules",
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

  const hasLeaveConflict = () => {
    const selectedEmp = employees.find((e) => e.employeeId === form.employeeId);
    if (!selectedEmp || !form.date || !form.fromTime || !form.toTime)
      return false;

    const shiftStart = new Date(form.date);
    const [fh, fm] = form.fromTime.split(":").map(Number);
    shiftStart.setHours(fh, fm, 0, 0);

    const shiftEnd = new Date(form.date);
    const [th, tm] = form.toTime.split(":").map(Number);
    shiftEnd.setHours(th, tm, 0, 0);

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
      const leaveStart = new Date(leave.fromDate);
      const leaveEnd = new Date(leave.toDate);

      const [lsh, lsm] = String(leave.startTime || "00:00")
        .split(":")
        .map(Number);
      const [leh, lem] = String(leave.endTime || "23:59")
        .split(":")
        .map(Number);

      leaveStart.setHours(lsh, lsm, 0, 0);
      leaveEnd.setHours(leh, lem, 0, 0);

      if (shiftStart < leaveEnd && shiftEnd > leaveStart) {
        return `Cannot schedule during approved leave time (${formatDateDDMMYYYY(
          leave.fromDate
        )} ${formatTimeAMPM(leave.startTime)} to ${formatDateDDMMYYYY(
          leave.toDate
        )} ${formatTimeAMPM(leave.endTime)})`;
      }
    }

    return false;
  };

  const createSchedule = async (e) => {
    e.preventDefault();

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
          employeeId: form.employeeId,
          date: form.date,
          fromTime: form.fromTime,
          toTime: form.toTime,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setOpen(false);
      setPop({
        open: true,
        type: "success",
        message: "Schedule created successfully",
      });
      fetchSchedules();
      fetchLeaves();
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: err.response?.data?.message || "Failed to create schedule",
      });
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

  const inputClass =
    "h-[42px] rounded-[12px] border border-slate-300 bg-white px-3 text-[14px] text-slate-900 outline-none focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.08)]";

  return (
    <>
      <Popup
        open={pop.open}
        type={pop.type}
        message={pop.message}
        onClose={() => setPop({ ...pop, open: false })}
      />

      <div className="min-h-screen bg-slate-50 font-['Poppins',sans-serif]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-slate-900">Schedules</h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Create and manage employee schedules
            </p>
          </div>

          <button
            className="inline-flex h-[42px] items-center gap-2 rounded-[12px] bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            onClick={openModal}
            type="button"
          >
            <FiPlus />
            Create Schedule
          </button>
        </div>

        

        <div className="mb-4 flex items-center gap-[10px] rounded-[14px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <FiSearch className="text-[16px] text-slate-500" />
          <input
            className="w-full border-none bg-transparent text-[14px] text-slate-900 outline-none"
            placeholder="Search by staff id, name, department, designation or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <div className="overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-[1150px] border-collapse">
              <thead>
                <tr className="bg-slate-900">
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Employee
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Staff ID
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Department
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Designation
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Date
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Time
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {tableRows.map((s, index) => (
                  <tr
                    key={s._id}
                    className={`border-t border-slate-200 transition hover:bg-slate-50 ${
                      index % 2 !== 0 ? "bg-slate-50/60" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          className="h-[46px] w-[46px] rounded-full border border-slate-200 bg-slate-100 object-cover"
                          src={`/photos/${s.employee?.employeeId || s.employeeId}.png`}
                          onError={(e) => (e.target.src = "/default-profile.png")}
                          alt="Profile"
                        />
                        <div>
                          <div className="text-[14px] font-semibold text-slate-900">
                            {s.employee?.name || s.employeeName || "-"}
                          </div>
                          <div className="text-[12px] text-slate-500">
                            {s.department || "-"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-[14px] font-medium text-slate-800">
                      {s.employee?.employeeId || s.employeeId || "-"}
                    </td>

                    <td className="px-4 py-4 text-[14px] text-slate-700">
                      {s.department || "-"}
                    </td>

                    <td className="px-4 py-4 text-[14px] text-slate-700">
                      {s.designation || "-"}
                    </td>

                    <td className="px-4 py-4 text-[14px] text-slate-700">
                      {formatDateDDMMYYYY(s.date)}
                    </td>

                    <td className="px-4 py-4 text-[14px] text-slate-700">
                      {formatTimeAMPM(s.fromTime)} - {formatTimeAMPM(s.toTime)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[12px] font-semibold capitalize ${getStatusClass(
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
                      className="px-4 py-10 text-center text-[14px] text-slate-500"
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
          <div
            className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-950/45 px-4"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-[720px] max-w-[96vw] rounded-[18px] border border-slate-200 bg-white p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[18px] font-bold text-slate-900">
                  Create Schedule
                </h3>
                <button
                  className="grid h-[36px] w-[36px] place-items-center rounded-[10px] border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <FiX />
                </button>
              </div>

              <form
                className="grid grid-cols-1 gap-3 md:grid-cols-2"
                onSubmit={createSchedule}
              >
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-slate-600">
                    Staff ID
                  </label>
                  <select
                    className={inputClass}
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

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-slate-600">
                    Name
                  </label>
                  <input
                    className={`${inputClass} bg-slate-50`}
                    value={form.employeeName}
                    readOnly
                    placeholder="Name"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-slate-600">
                    Department
                  </label>
                  <input
                    className={`${inputClass} bg-slate-50`}
                    value={form.department}
                    readOnly
                    placeholder="Department"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-slate-600">
                    Designation
                  </label>
                  <input
                    className={`${inputClass} bg-slate-50`}
                    value={form.designation}
                    readOnly
                    placeholder="Designation"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-slate-600">
                    Date
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-slate-600">
                    From
                  </label>
                  <input
                    type="time"
                    className={inputClass}
                    value={form.fromTime}
                    onChange={(e) =>
                      setForm({ ...form, fromTime: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-start-2">
                  <label className="text-[13px] font-medium text-slate-600">
                    To
                  </label>
                  <input
                    type="time"
                    className={inputClass}
                    value={form.toTime}
                    onChange={(e) =>
                      setForm({ ...form, toTime: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="mt-4 flex justify-end gap-[10px] md:col-span-2">
                  <button
                    className="h-[42px] rounded-[12px] bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                    type="submit"
                  >
                    Save Schedule
                  </button>
                  <button
                    className="h-[42px] rounded-[12px] bg-slate-300 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-400"
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
      </div>
    </>
  );
}

export default Schedules;
