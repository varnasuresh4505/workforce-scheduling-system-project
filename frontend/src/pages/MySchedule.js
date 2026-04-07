import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Popup from "../components/Popup";
import { API_BASE_URL } from "../services/api";

const pad2 = (n) => String(n).padStart(2, "0");

const formatDDMMYYYY = (dateValue) => {
  if (!dateValue) return "-";
  const d = new Date(dateValue);
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
};

const formatAMPM = (time) => {
  if (!time) return "-";
  const [hh, mm] = String(time).split(":");
  const h = parseInt(hh, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${pad2(hour12)}:${mm} ${ampm}`;
};

const getShiftStatus = (dateStr, fromTime, toTime) => {
  try {
    const now = new Date();

    const d = new Date(dateStr);
    const [fh, fm] = String(fromTime).split(":").map(Number);
    const [th, tm] = String(toTime).split(":").map(Number);

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

function MySchedule() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [pop, setPop] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const [mySchedules, setMySchedules] = useState([]);

  useEffect(() => {
    if (!user) return navigate("/");
    if (user.role !== "employee") return navigate("/dashboard");
    fetchMySchedules();
    // eslint-disable-next-line
  }, []);

  const fetchMySchedules = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/schedules/my`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setMySchedules(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: "Failed to load your schedule",
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
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-bold text-slate-900">My Schedule</h2>
            <p className="mt-1 text-[13px] text-slate-500">
              View your assigned shifts
            </p>
          </div>

          <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200">
            {mySchedules.length} Records
          </span>
        </div>

        <div className="rounded-[14px] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="max-h-[520px] overflow-y-auto rounded-[10px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left font-semibold text-white">
                    Staff ID
                  </th>
                  <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left font-semibold text-white">
                    Name
                  </th>
                  <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left font-semibold text-white">
                    Date
                  </th>
                  <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left font-semibold text-white">
                    Time
                  </th>
                  <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left font-semibold text-white">
                    Status
                  </th>
                  <th className="sticky top-0 z-[5] bg-slate-900 px-3 py-3 text-left font-semibold text-white">
                    Assigned By
                  </th>
                </tr>
              </thead>

              <tbody>
                {mySchedules.map((s, index) => {
                  const fromTime = s.fromTime || s.startTime;
                  const toTime = s.toTime || s.endTime;
                  const status = getShiftStatus(s.date, fromTime, toTime);

                  return (
                    <tr key={s._id}>
                      <td
                        className={`border border-slate-200 px-3 py-3 text-slate-900 ${
                          index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                        }`}
                      >
                        {s.employee?.employeeId || s.employeeId || "-"}
                      </td>

                      <td
                        className={`border border-slate-200 px-3 py-3 text-slate-900 ${
                          index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                        }`}
                      >
                        {s.employee?.name || s.employeeName || "-"}
                      </td>

                      <td
                        className={`border border-slate-200 px-3 py-3 text-slate-900 ${
                          index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                        }`}
                      >
                        {formatDDMMYYYY(s.date)}
                      </td>

                      <td
                        className={`border border-slate-200 px-3 py-3 text-slate-900 ${
                          index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                        }`}
                      >
                        {formatAMPM(fromTime)} - {formatAMPM(toTime)}
                      </td>

                      <td
                        className={`border border-slate-200 px-3 py-3 text-slate-900 ${
                          index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                        }`}
                      >
                        <span
                          className={`inline-block rounded-full px-[10px] py-[5px] text-[12px] font-semibold capitalize ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td
                        className={`border border-slate-200 px-3 py-3 text-slate-900 ${
                          index % 2 !== 0 ? "bg-slate-50" : "bg-white"
                        }`}
                      >
                        {s.assignedBy?.name || "-"}
                      </td>
                    </tr>
                  );
                })}

                {mySchedules.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      No schedule assigned yet
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

export default MySchedule;
