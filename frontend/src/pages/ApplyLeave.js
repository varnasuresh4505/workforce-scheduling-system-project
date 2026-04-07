import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Popup from "../components/Popup";

const getStatusClass = (status) => {
  if (status === "approved") return "bg-green-100 text-green-700";
  if (status === "rejected") return "bg-red-100 text-red-700";
  return "bg-orange-100 text-orange-700";
};

function ApplyLeave() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [form, setForm] = useState({
    fromDate: "",
    toDate: "",
    startTime: "09:00",
    endTime: "17:00",
    reason: "",
  });

  const [myLeaves, setMyLeaves] = useState([]);
  const [pop, setPop] = useState({
    open: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    if (!user) return navigate("/");
    if (user.role !== "employee") return navigate("/dashboard");
    fetchMyLeaves();
    // eslint-disable-next-line
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves/my", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMyLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: "Failed to load leave data",
      });
    }
  };

  const pad2 = (n) => String(n).padStart(2, "0");

  const getTodayDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(
      now.getDate()
    )}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  };

  const formatTime = (time) => {
    if (!time) return "-";
    const [hour, minute] = String(time).split(":");
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const formatDDMMYYYY = (dateValue) => {
    if (!dateValue) return "-";
    const d = new Date(dateValue);
    return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
  };

  const formatStatus = (s) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : "-";

  const inputClass =
    "h-[44px] rounded-[12px] border border-slate-300 bg-white px-3 text-[14px] text-slate-900 outline-none focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.08)]";

  const todayDate = getTodayDate();
  const currentTime = getCurrentTime();

  const applyLeave = async (e) => {
    e.preventDefault();

    const today = getTodayDate();
    const nowTime = getCurrentTime();

    if (form.fromDate < today || form.toDate < today) {
      setPop({
        open: true,
        type: "error",
        message: "You cannot apply leave for past dates",
      });
      return;
    }

    if (form.toDate < form.fromDate) {
      setPop({
        open: true,
        type: "error",
        message: "To Date cannot be earlier than From Date",
      });
      return;
    }

    if (form.fromDate === form.toDate && form.endTime <= form.startTime) {
      setPop({
        open: true,
        type: "error",
        message: "End Time must be greater than Start Time",
      });
      return;
    }

    if (form.fromDate === today && form.startTime < nowTime) {
      setPop({
        open: true,
        type: "error",
        message: "Start Time cannot be in the past for today's leave",
      });
      return;
    }

    if (form.toDate === today && form.endTime < nowTime) {
      setPop({
        open: true,
        type: "error",
        message: "End Time cannot be in the past for today's leave",
      });
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/leaves", form, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setPop({
        open: true,
        type: "success",
        message: "Leave applied successfully. Status: Pending",
      });

      setForm({
        fromDate: "",
        toDate: "",
        startTime: "09:00",
        endTime: "17:00",
        reason: "",
      });

      fetchMyLeaves();
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: err.response?.data?.message || "Failed to apply leave",
      });
    }
  };

  return (
    <Layout>
      <Popup
        open={pop.open}
        type={pop.type}
        message={pop.message}
        onClose={() => setPop({ ...pop, open: false })}
      />

      <div className="min-h-screen bg-slate-50 p-4 font-['Poppins',sans-serif]">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-[20px] font-bold text-slate-900">
              Apply Leave
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Submit your leave request and track approval status
            </p>
          </div>

          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600">
            {myLeaves.length} Records
          </span>
        </div>

        <div className="mb-4 rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-[16px] font-semibold text-slate-900">
            Leave Form
          </h3>

          <form
            className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"
            onSubmit={applyLeave}
          >
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-medium text-slate-600">
                From Date
              </label>
              <input
                className={inputClass}
                type="date"
                min={todayDate}
                value={form.fromDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    fromDate: value,
                    toDate:
                      prev.toDate && prev.toDate < value ? value : prev.toDate,
                  }));
                }}
                required
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-medium text-slate-600">
                To Date
              </label>
              <input
                className={inputClass}
                type="date"
                min={form.fromDate || todayDate}
                value={form.toDate}
                onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-medium text-slate-600">
                Start Time
              </label>
              <input
                className={inputClass}
                type="time"
                min={form.fromDate === todayDate ? currentTime : undefined}
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                required
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-medium text-slate-600">
                End Time
              </label>
              <input
                className={inputClass}
                type="time"
                min={
                  form.fromDate === form.toDate ? form.startTime : undefined
                }
                value={form.endTime}
                onChange={(e) =>
                  setForm({ ...form, endTime: e.target.value })
                }
                required
              />
            </div>

            <div className="flex flex-col gap-[6px] md:col-span-2 xl:col-span-4">
              <label className="text-[13px] font-medium text-slate-600">
                Reason
              </label>
              <textarea
                className="min-h-[96px] rounded-[12px] border border-slate-300 bg-white px-3 py-3 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.08)]"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Explain your reason for leave"
                required
              />
            </div>

            <div className="flex justify-end md:col-span-2 xl:col-span-4">
              <button
                className="h-[42px] rounded-[12px] bg-slate-900 px-4 text-[14px] font-semibold text-white transition hover:bg-slate-800"
                type="submit"
              >
                Submit Leave
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="bg-slate-900">
                  <th className="px-4 py-3 text-left text-[13px] font-semibold text-white">
                    From
                  </th>
                  <th className="px-4 py-3 text-left text-[13px] font-semibold text-white">
                    To
                  </th>
                  <th className="px-4 py-3 text-left text-[13px] font-semibold text-white">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-[13px] font-semibold text-white">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-[13px] font-semibold text-white">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {myLeaves.map((l, index) => (
                  <tr
                    key={l._id}
                    className={`border-t border-slate-200 ${
                      index % 2 !== 0 ? "bg-slate-50/70" : "bg-white"
                    } hover:bg-slate-50`}
                  >
                    <td className="px-4 py-4 text-[14px] text-slate-700">
                      {formatDDMMYYYY(l.fromDate)}
                    </td>

                    <td className="px-4 py-4 text-[14px] text-slate-700">
                      {formatDDMMYYYY(l.toDate)}
                    </td>

                    <td className="px-4 py-4 text-[14px] text-slate-700">
                      {formatTime(l.startTime)} - {formatTime(l.endTime)}
                    </td>

                    <td className="max-w-[360px] px-4 py-4 text-[14px] text-slate-700">
                      {l.reason}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[12px] font-semibold capitalize ${getStatusClass(
                          l.status
                        )}`}
                      >
                        {formatStatus(l.status)}
                      </span>
                    </td>
                  </tr>
                ))}

                {myLeaves.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-10 text-center text-[14px] text-slate-500"
                    >
                      No leave requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ApplyLeave;