import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Popup from "../components/Popup";
import Schedules from "./Schedules";

const pad2 = (n) => String(n).padStart(2, "0");

const formatDDMMYYYY = (dateValue) => {
  if (!dateValue) return "-";
  const d = new Date(dateValue);
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
};

const formatAMPM = (time) => {
  if (!time) return "-";
  const t = String(time).trim();

  if (/am|pm/i.test(t)) {
    return t.replace(/\s+/g, "").toUpperCase();
  }

  const parts = t.split(":");
  const h = parseInt(parts[0], 10);
  const m = parts[1] || "00";

  if (Number.isNaN(h)) return t;

  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;

  return `${pad2(hour12)}:${m}${ampm}`;
};

const statusFromNow = (dateValue, fromTime, toTime) => {
  if (!dateValue || !fromTime || !toTime) return "inactive";

  const now = new Date();
  const d = new Date(dateValue);
  d.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (d.getTime() !== today.getTime()) {
    return d.getTime() > today.getTime() ? "inactive" : "completed";
  }

  const [fh, fm] = fromTime.split(":").map(Number);
  const [th, tm] = toTime.split(":").map(Number);

  const start = new Date();
  start.setHours(fh, fm, 0, 0);

  const end = new Date();
  end.setHours(th, tm, 0, 0);

  if (now >= start && now <= end) return "active";
  if (now > end) return "completed";
  return "inactive";
};

const getStatusClasses = (status) => {
  if (status === "active") {
    return "bg-green-100 text-green-700";
  }
  if (status === "completed") {
    return "bg-orange-100 text-orange-700";
  }
  return "bg-red-100 text-red-700";
};

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [pop, setPop] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const [adminData, setAdminData] = useState({
    totalEmployees: 0,
    todayPresent: 0,
    todayShifts: 0,
    latestSchedules: [],
  });

  const [empData, setEmpData] = useState({
    user: null,
    totalHours: "0.00",
    mySchedules: [],
  });

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    loadDashboard();

    const onFocus = () => loadDashboard();
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line
  }, []);

  const loadDashboard = async () => {
    if (!user) return;

    if (user.role === "admin") {
      await fetchAdmin();
    } else {
      await fetchEmployee();
    }
  };

  const fetchAdmin = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setAdminData({
        totalEmployees: res.data?.totalEmployees || 0,
        todayPresent: res.data?.todayPresent || 0,
        todayShifts: res.data?.todayShifts || 0,
        latestSchedules: Array.isArray(res.data?.latestSchedules)
          ? res.data.latestSchedules
          : [],
      });
    } catch (err) {
      console.error(err);
      setPop({
        open: true,
        type: "error",
        message: "Failed to load admin dashboard",
      });
    }
  };

  const fetchEmployee = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/me", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setEmpData({
        user: res.data?.user || null,
        totalHours: res.data?.totalHours || "0.00",
        mySchedules: Array.isArray(res.data?.mySchedules)
          ? res.data.mySchedules
          : [],
      });
    } catch (err) {
      console.error(err);
      setPop({
        open: true,
        type: "error",
        message: "Failed to load employee dashboard",
      });
    }
  };

  const rows = useMemo(() => {
    const list =
      user?.role === "admin" ? adminData.latestSchedules : empData.mySchedules;
    return Array.isArray(list) ? list : [];
  }, [adminData.latestSchedules, empData.mySchedules, user?.role]);

  return (
    <Layout>
      <Popup
        open={pop.open}
        type={pop.type}
        message={pop.message}
        onClose={() => setPop({ ...pop, open: false })}
      />

      <div className="h-screen overflow-hidden bg-slate-100 px-[22px] py-[18px] font-['Poppins',sans-serif]">
        {user?.role === "admin" ? (
          <>
            <Schedules />
          </>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <div className="mt-8 text-[20px] font-extrabold text-slate-900">
                Dashboard
              </div>

              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-[0px_6px_18px_rgba(15,23,42,0.06)]">
                <span className="text-[13px] font-bold text-slate-900">
                  Welcome, {user?.name} !
                </span>
              </div>
            </div>
            <div className="sticky top-[52px] z-40 grid grid-cols-1 gap-[14px] bg-slate-100 pb-[14px] md:grid-cols-3">
              <div className="rounded-[14px] border border-gray-200 bg-white p-[14px] shadow-[0px_6px_18px_rgba(15,23,42,0.06)] md:col-span-1">
                <div className="text-[14px] font-semibold text-slate-500">
                  Total Working Hours (This Week)
                </div>

                <div className="mt-[6px] text-[26px] font-extrabold text-slate-900">
                  {empData.totalHours || "0.00"}
                </div>
              </div>
            </div>

            <div className="min-h-screen overflow-y-hidden bg-slate-100 p-7 font-['Poppins',Arial,sans-serif]">
              <h2 className="mb-[14px] text-[22px] font-semibold text-slate-900">
                My Profile
              </h2>

              <div className="grid max-w-[1200px] grid-cols-1 gap-[18px] rounded-[14px] border border-gray-200 bg-white p-[18px] shadow-[0px_6px_18px_rgba(15,23,42,0.08)] md:grid-cols-[140px_1fr]">
                <div className="flex items-start justify-center pt-[6px] md:justify-center">
                  <img
                    className="h-[150px] w-[150px] rounded-[12px] border border-gray-200 bg-slate-100 object-cover"
                    src={`/photos/${empData.user?.employeeId}.png`}
                    onError={(e) => (e.target.src = "/default-profile.png")}
                    alt="Profile"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[10px] text-[20px] font-semibold text-slate-900">
                      {empData.user?.name || "-"}
                      <span
                        className="inline-block h-[10px] w-[10px] rounded-full bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.2)]"
                        title="Active"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-y-[30px] gap-x-[25px] md:grid-cols-3">
                    <div>
                      <div className="mb-2 text-[15px] font-medium text-slate-500">
                        Staff Name
                      </div>
                      <div className="text-[14px] font-medium text-slate-900">
                        {empData.user?.name || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[15px] font-medium text-slate-500">
                        Staff ID
                      </div>
                      <div className="text-[14px] font-medium text-slate-900">
                        {empData.user?.employeeId || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[15px] font-medium text-slate-500">
                        Department
                      </div>
                      <div className="text-[14px] font-medium text-slate-900">
                        {empData.user?.department || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[15px] font-medium text-slate-500">
                        Designation
                      </div>
                      <div className="text-[14px] font-medium text-slate-900">
                        {empData.user?.designation || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[15px] font-medium text-slate-500">
                        Email
                      </div>
                      <div className="text-[14px] font-medium text-slate-900">
                        {empData.user?.email || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[15px] text-slate-500">
                        Mobile
                      </div>
                      <div className="text-[14px] font-medium text-slate-900">
                        {empData.user?.mobile || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[15px] font-medium text-slate-500">
                        Gender
                      </div>
                      <div className="text-[14px] font-medium text-slate-900">
                        {empData.user?.gender || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[15px] font-medium text-slate-500">
                        Date of Birth
                      </div>
                      <div className="text-[14px] font-medium text-slate-900">
                        {formatDDMMYYYY(empData.user?.dob)}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[15px] font-medium text-slate-500">
                        Total Hours (This Week)
                      </div>
                      <div className="text-[14px] font-medium text-slate-900">
                        {empData.totalHours || "0.00"}
                      </div>
                    </div>

                    <div className="md:col-span-3">
                      <div className="mb-2 text-[15px] font-medium text-slate-500">
                        Address
                      </div>
                      <div className="text-[14px] font-medium text-slate-900">
                        {empData.user?.address || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;
