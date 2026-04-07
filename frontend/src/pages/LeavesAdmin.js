import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Popup from "../components/Popup";
import { FiSearch } from "react-icons/fi";
import { API_BASE_URL } from "../services/api";

const pad2 = (n) => String(n).padStart(2, "0");

const formatDDMMYYYY = (dateValue) => {
  if (!dateValue) return "-";
  const d = new Date(dateValue);
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
};

const formatTimeAMPM = (time) => {
  if (!time) return "-";
  const t = String(time).trim();

  if (/am|pm/i.test(t)) return t.replace(/\s+/g, " ").toUpperCase();

  const [hh, mm = "00"] = t.split(":");
  const h = parseInt(hh, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;

  return `${pad2(hour12)}:${mm} ${ampm}`;
};

const getStatusClass = (status) => {
  const s = String(status || "").toLowerCase();

  if (s === "approved") return "bg-green-100 text-green-700";
  if (s === "rejected") return "bg-red-100 text-red-700";
  return "bg-orange-100 text-orange-700";
};

const toMinutes = (time) => {
  if (!time) return 0;
  const t = String(time).trim();

  if (/am|pm/i.test(t)) {
    const clean = t.toUpperCase().replace(/\s+/g, " ");
    const [timePart, meridiem] = clean.split(" ");
    let [hh, mm = "00"] = timePart.split(":").map(Number);

    if (meridiem === "PM" && hh !== 12) hh += 12;
    if (meridiem === "AM" && hh === 12) hh = 0;

    return hh * 60 + mm;
  }

  const [hh, mm = "00"] = t.split(":").map(Number);
  return hh * 60 + mm;
};

const isPastLeave = (leave) => {
  if (!leave?.toDate) return false;

  const endDate = new Date(leave.toDate);
  const now = new Date();

  if (leave.endTime) {
    const mins = toMinutes(leave.endTime);
    endDate.setHours(Math.floor(mins / 60), mins % 60, 59, 999);
  } else {
    endDate.setHours(23, 59, 59, 999);
  }

  return endDate < now;
};

function LeavesAdmin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState("");
  const [pop, setPop] = useState({
    open: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    if (!user) return navigate("/");
    if (user.role !== "admin") return navigate("/dashboard");

    fetchLeaves();
    // eslint-disable-next-line
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/leaves`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: err.response?.data?.message || "Failed to fetch leaves",
      });
    }
  };

  const updateStatus = async (leaveObj, status) => {
    if (isPastLeave(leaveObj)) {
      setPop({
        open: true,
        type: "error",
        message: "You cannot approve or reject a leave request for past leave dates",
      });
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/leaves/${leaveObj._id}`, { status }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setPop({
        open: true,
        type: "success",
        message: `Leave ${status} successfully`,
      });

      fetchLeaves();
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: err.response?.data?.message || "Failed to update status",
      });
    }
  };

  const tableRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leaves;

    return leaves.filter((l) => {
      const haystack = [
        l.employee?.employeeId,
        l.employee?.name,
        l.employee?.email,
        formatDDMMYYYY(l.fromDate),
        formatDDMMYYYY(l.toDate),
        l.reason,
        l.status,
        `${formatTimeAMPM(l.startTime)}-${formatTimeAMPM(l.endTime)}`,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [leaves, search]);

  return (
    <Layout>
      <Popup
        open={pop.open}
        type={pop.type}
        message={pop.message}
        onClose={() => setPop({ ...pop, open: false })}
      />

      <div className="min-h-screen bg-slate-50 p-4 font-['Poppins',sans-serif] md:p-5">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-[20px] font-bold text-slate-900">
              Leave Requests
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Review and update employee leave status
            </p>
          </div>

          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600">
            {tableRows.length} Records
          </span>
        </div>

        <div className="mb-4 flex items-center gap-[10px] rounded-[16px] border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <FiSearch className="text-[16px] text-slate-500" />
          <input
            className="w-full border-none bg-transparent text-[14px] text-slate-900 outline-none"
            placeholder="Search by employee id, name, email, reason or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <div className="overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-[1200px] border-collapse">
              <thead>
                <tr className="bg-slate-900">
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Employee
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Staff ID
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    From
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    To
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Time
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Reason
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Status
                  </th>
                  <th className="px-4 py-4 text-center text-[13px] font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {tableRows.map((l, index) => {
                  const pastLeave = isPastLeave(l);
                  const alreadyFinal =
                    String(l.status || "").toLowerCase() === "approved" ||
                    String(l.status || "").toLowerCase() === "rejected";

                  return (
                    <tr
                      key={l._id}
                      className={`border-t border-slate-200 transition hover:bg-slate-50 ${
                        index % 2 !== 0 ? "bg-slate-50/60" : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div className="text-[14px] font-semibold text-slate-900">
                          {l.employee?.name || "-"}
                        </div>
                        <div className="text-[12px] text-slate-500">
                          {l.employee?.email || "-"}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-[14px] font-medium text-slate-800">
                        {l.employee?.employeeId || "-"}
                      </td>

                      <td className="px-4 py-4 text-[14px] text-slate-700">
                        {formatDDMMYYYY(l.fromDate)}
                      </td>

                      <td className="px-4 py-4 text-[14px] text-slate-700">
                        {formatDDMMYYYY(l.toDate)}
                      </td>

                      <td className="px-4 py-4 text-[14px] text-slate-700">
                        {formatTimeAMPM(l.startTime)} - {formatTimeAMPM(l.endTime)}
                      </td>

                      <td className="max-w-[280px] px-4 py-4 text-[14px] text-slate-700">
                        {l.reason || "-"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-[12px] font-semibold capitalize ${getStatusClass(
                            l.status
                          )}`}
                        >
                          {l.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className={`rounded-[10px] px-3 py-2 text-[13px] font-semibold text-white transition ${
                              pastLeave || alreadyFinal
                                ? "cursor-not-allowed bg-green-300"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                            onClick={() => updateStatus(l, "approved")}
                            type="button"
                            disabled={pastLeave || alreadyFinal}
                            title={
                              pastLeave
                                ? "Cannot approve past leave"
                                : alreadyFinal
                                ? "Status already updated"
                                : "Approve leave"
                            }
                          >
                            Approve
                          </button>

                          <button
                            className={`rounded-[10px] px-3 py-2 text-[13px] font-semibold text-white transition ${
                              pastLeave || alreadyFinal
                                ? "cursor-not-allowed bg-red-300"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                            onClick={() => updateStatus(l, "rejected")}
                            type="button"
                            disabled={pastLeave || alreadyFinal}
                            title={
                              pastLeave
                                ? "Cannot reject past leave"
                                : alreadyFinal
                                ? "Status already updated"
                                : "Reject leave"
                            }
                          >
                            Reject
                          </button>
                        </div>

                       
                      </td>
                    </tr>
                  );
                })}

                {tableRows.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-10 text-center text-[14px] text-slate-500"
                    >
                      No leave requests found
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

export default LeavesAdmin;
