import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { FiSearch } from "react-icons/fi";

const pad2 = (n) => String(n).padStart(2, "0");

const formatDDMMYYYY = (dateValue) => {
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

  if (s === "approved") {
    return "bg-green-100 text-green-700";
  }

  if (s === "rejected") {
    return "bg-red-100 text-red-700";
  }

  return "bg-orange-100 text-orange-700";
};

function LeavesAdmin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return navigate("/");
    if (user.role !== "admin") return navigate("/dashboard");

    fetchLeaves();
    // eslint-disable-next-line
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setLeaves(res.data || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch leaves");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/leaves/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
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
      <div className="min-h-screen bg-slate-100 p-[26px] font-['Poppins',sans-serif] max-[900px]:p-[18px]">
        <div className="mb-[14px]">
          <div className="mb-3 flex items-center justify-between">
            <div className="mt-5 text-[20px] font-extrabold text-slate-900">
              Leave Requests
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
        </div>

        <div className="rounded-[14px] border border-gray-200 bg-white p-[18px] shadow-[0px_6px_18px_rgba(15,23,42,0.06)]">
          <div className="mb-[10px] flex items-center justify-between">
            <h3 className="m-0 text-[16px] font-semibold text-slate-900">
              Leave List
            </h3>
            <span className="rounded-full bg-slate-100 px-[10px] py-[6px] text-[12px] text-slate-500">
              {tableRows.length} Records
            </span>
          </div>

          <div className="max-h-[480px] overflow-y-auto rounded-[12px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="min-w-[900px] w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                    Emp ID
                  </th>
                  <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                    Employee
                  </th>
                  <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                    From Date
                  </th>
                  <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                    To Date
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
                  <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left text-[13px] font-semibold text-white">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {tableRows.map((l, index) => (
                  <tr key={l._id}>
                    <td
                      className={`border border-gray-200 px-3 py-3 align-top text-[15px] text-slate-900 ${
                        index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      {l.employee?.employeeId || "-"}
                    </td>

                    <td
                      className={`border border-gray-200 px-3 py-3 align-top text-[15px] text-slate-900 ${
                        index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      {l.employee?.name || "-"}
                      <br />
                      <small className="text-gray-500">
                        {l.employee?.email || ""}
                      </small>
                    </td>

                    <td
                      className={`border border-gray-200 px-3 py-3 align-top text-[15px] text-slate-900 ${
                        index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      {formatDDMMYYYY(l.fromDate)}
                    </td>

                    <td
                      className={`border border-gray-200 px-3 py-3 align-top text-[15px] text-slate-900 ${
                        index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      {formatDDMMYYYY(l.toDate)}
                    </td>

                    <td
                      className={`border border-gray-200 px-3 py-3 align-top text-[15px] text-slate-900 ${
                        index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      {formatTimeAMPM(l.startTime)} - {formatTimeAMPM(l.endTime)}
                    </td>

                    <td
                      className={`border border-gray-200 px-3 py-3 align-top text-[15px] text-slate-900 ${
                        index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      {l.reason || "-"}
                    </td>

                    <td
                      className={`border border-gray-200 px-3 py-3 align-top text-[15px] text-slate-900 ${
                        index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      <span
                        className={`inline-block rounded-full px-[10px] py-[6px] text-[12px] font-bold capitalize ${getStatusClass(
                          l.status
                        )}`}
                      >
                        {l.status}
                      </span>
                    </td>

                    <td
                      className={`border border-gray-200 px-3 py-3 align-top text-[15px] text-slate-900 ${
                        index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-[10px]">
                        <button
                          className="rounded-[10px] bg-green-600 px-3 py-[7px] font-semibold text-white transition hover:brightness-95"
                          onClick={() => updateStatus(l._id, "approved")}
                          type="button"
                        >
                          Approve
                        </button>
                        <button
                          className="rounded-[10px] bg-red-600 px-3 py-[7px] font-semibold text-white transition hover:brightness-95"
                          onClick={() => updateStatus(l._id, "rejected")}
                          type="button"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {tableRows.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-[18px] py-[18px] text-center text-slate-500"
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