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
      setMyLeaves(res.data || []);
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: "Failed to load leave data",
      });
    }
  };

  const applyLeave = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/leaves", form, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setPop({
        open: true,
        type: "success",
        message: "Leave Applied Successfully ✅ Status: Pending",
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

  const formatTime = (time) => {
    if (!time) return "-";
    const [hour, minute] = time.split(":");
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const pad2 = (n) => String(n).padStart(2, "0");

  const formatDDMMYYYY = (dateValue) => {
    const d = new Date(dateValue);
    return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
  };

  const formatStatus = (s) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : "-";

  return (
    <Layout>
      <Popup
        open={pop.open}
        type={pop.type}
        message={pop.message}
        onClose={() => setPop({ ...pop, open: false })}
      />

      <div className="min-h-screen bg-slate-100 p-[26px] font-['Poppins',sans-serif]">
        <div className="mb-[14px]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="mt-[53px] mb-0 text-[14px] text-slate-500">
                Select dates, time range, and submit your reason
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-[14px] border border-gray-200 bg-white p-[18px] shadow-[0px_6px_18px_rgba(15,23,42,0.06)]">
          <div className="mb-[10px] flex items-center justify-between">
            <h3 className="m-0 text-[16px] font-semibold text-slate-900">
              Leave Form
            </h3>
            <span className="rounded-full bg-slate-100 px-[10px] py-[6px] text-[12px] text-slate-500">
              Fill all fields
            </span>
          </div>

          <form
            className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"
            onSubmit={applyLeave}
          >
            <div className="flex flex-col gap-[6px]">
              <label className="text-[14px] font-medium text-slate-600">
                From Date
              </label>
              <input
                className="h-[44px] rounded-[12px] border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]"
                type="date"
                value={form.fromDate}
                onChange={(e) =>
                  setForm({ ...form, fromDate: e.target.value })
                }
                required
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[14px] font-medium text-slate-600">
                To Date
              </label>
              <input
                className="h-[44px] rounded-[12px] border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]"
                type="date"
                value={form.toDate}
                onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[14px] font-medium text-slate-600">
                Start Time
              </label>
              <input
                className="h-[44px] rounded-[12px] border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]"
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                required
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[14px] font-medium text-slate-600">
                End Time
              </label>
              <input
                className="h-[44px] rounded-[12px] border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]"
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm({ ...form, endTime: e.target.value })
                }
                required
              />
            </div>

            <div className="flex flex-col gap-[6px] md:col-span-2 xl:col-span-4">
              <label className="text-[14px] font-medium text-slate-600">
                Reason
              </label>
              <input
                className="h-[44px] rounded-[12px] border border-slate-300 bg-white px-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]"
                type="text"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Explain briefly (e.g., medical, personal)"
                required
              />
            </div>

            <div className="md:col-span-2 xl:col-span-4 flex justify-end">
              <button
                className="h-[44px] rounded-[12px] bg-slate-900 px-4 font-semibold text-white transition hover:bg-slate-800"
                type="submit"
              >
                Submit Leave
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-[14px] border border-gray-200 bg-white p-[18px] shadow-[0px_6px_18px_rgba(15,23,42,0.06)]">
          <div className="mb-[10px] flex items-center justify-between">
            <h3 className="m-0 text-[16px] font-semibold text-slate-900">
              My Leave Status
            </h3>
            <span className="rounded-full bg-slate-100 px-[10px] py-[6px] text-[12px] text-slate-500">
              {myLeaves.length} Records
            </span>
          </div>

          <div className="max-h-[215px] overflow-y-auto rounded-[12px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr>
                  <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                    From
                  </th>
                  <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                    To
                  </th>
                  <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                    Time
                  </th>
                  <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                    Reason
                  </th>
                  <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {myLeaves.map((l, index) => (
                  <tr key={l._id}>
                    <td
                      className={`border border-gray-200 px-3 py-3 text-[15px] text-slate-900 ${
                        index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      {formatDDMMYYYY(l.fromDate)}
                    </td>

                    <td
                      className={`border border-gray-200 px-3 py-3 text-[15px] text-slate-900 ${
                        index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      {formatDDMMYYYY(l.toDate)}
                    </td>

                    <td
                      className={`border border-gray-200 px-3 py-3 text-[15px] text-slate-900 ${
                        index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      {formatTime(l.startTime)} - {formatTime(l.endTime)}
                    </td>

                    <td
                      className={`max-w-[420px] border border-gray-200 px-3 py-3 text-[15px] text-slate-900 ${
                        index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      {l.reason}
                    </td>

                    <td
                      className={`border border-gray-200 px-3 py-3 text-[15px] text-slate-900 ${
                        index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      <span
                        className={`inline-block rounded-full px-[10px] py-[6px] text-[12px] font-bold capitalize ${getStatusClass(
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
                      className="px-[18px] py-[18px] text-center text-slate-500"
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