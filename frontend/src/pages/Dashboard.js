import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Popup from "../components/Popup";
import Schedules from "./Schedules";
import { API_BASE_URL } from "../services/api";
import {
  FiClock,
  FiUser,
  FiHash,
  FiBriefcase,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiUsers,
} from "react-icons/fi";
import { BsGenderAmbiguous } from "react-icons/bs";

const pad2 = (n) => String(n).padStart(2, "0");

const formatDDMMYYYY = (dateValue) => {
  if (!dateValue) return "-";
  const d = new Date(dateValue);
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
};

const formatTimeAMPM = (time) => {
  if (!time) return "-";
  const t = String(time).trim();

  if (/am|pm/i.test(t)) {
    return t
      .replace(/\s+/g, " ")
      .replace(/am/i, "AM")
      .replace(/pm/i, "PM");
  }

  const [hh, mm = "00"] = t.split(":");
  const h = parseInt(hh, 10);
  if (Number.isNaN(h)) return t;

  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${mm} ${ampm}`;
};

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [pop, setPop] = useState({
    open: false,
    type: "success",
    message: "",
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

    if (user.role !== "admin") {
      await fetchEmployee();
    }
  };

  const fetchEmployee = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/me`, {
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

  const todaySchedule = useMemo(() => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(
      today.getDate()
    )}`;

    return empData.mySchedules.find((item) => {
      if (!item?.date) return false;
      const d = new Date(item.date);
      const itemKey = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
        d.getDate()
      )}`;
      return itemKey === todayKey;
    });
  }, [empData.mySchedules]);

  const infoCards = [
    {
      label: "Staff Name",
      value: empData.user?.name || "-",
      icon: <FiUser />,
    },
    {
      label: "Staff ID",
      value: empData.user?.employeeId || "-",
      icon: <FiHash />,
    },
    {
      label: "Department",
      value: empData.user?.department || "-",
      icon: <FiUsers />,
    },
    {
      label: "Designation",
      value: empData.user?.designation || "-",
      icon: <FiBriefcase />,
    },
    {
      label: "Email",
      value: empData.user?.email || "-",
      icon: <FiMail />,
      breakAll: true,
    },
    {
      label: "Mobile",
      value: empData.user?.mobile || "-",
      icon: <FiPhone />,
    },
    {
      label: "Gender",
      value: empData.user?.gender || "-",
      icon: <BsGenderAmbiguous />,
    },
    {
      label: "Date of Birth",
      value: formatDDMMYYYY(empData.user?.dob),
      icon: <FiCalendar />,
    },
    {
      label: "Address",
      value: empData.user?.address || "-",
      icon: <FiMapPin />,
      wide: true,
    },
  ];

  return (
    <Layout>
      <Popup
        open={pop.open}
        type={pop.type}
        message={pop.message}
        onClose={() => setPop({ ...pop, open: false })}
      />

      <div className="min-h-screen overflow-hidden bg-slate-50 p-4 font-['Poppins',sans-serif] md:p-6">
        {user?.role === "admin" ? (
          <Schedules />
        ) : (
          <div className="space-y-5">
            <div className="rounded-[28px] border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50 p-5 shadow-[0_12px_35px_rgba(148,163,184,0.12)] md:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  

                  <h2 className="mt-4 text-[24px] font-bold leading-tight text-slate-900 md:text-[30px]">
                    Welcome back, {empData.user?.name || "Employee"}
                  </h2>

                  <p className="mt-2 max-w-[620px] text-[14px] leading-6 text-slate-600">
                    Track your working hours, view your profile details, and stay
                    updated
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="min-w-[220px] rounded-[22px] border border-sky-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-[20px] text-sky-700">
                        <FiClock />
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-slate-500">
                          Total Working Hours
                        </p>
                        <h3 className="mt-1 text-[24px] font-bold text-slate-900">
                          {empData.totalHours || "0.00"}
                        </h3>
                        <p className="text-[12px] text-slate-500">This week</p>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-[220px] rounded-[22px] border border-emerald-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-[20px] text-emerald-700">
                        <FiCalendar />
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-slate-500">
                          Today&apos;s Shift
                        </p>
                        <h3 className="mt-1 text-[17px] font-bold text-slate-900">
                          {todaySchedule
                            ? `${formatTimeAMPM(
                                todaySchedule.startTime || todaySchedule.fromTime
                              )} - ${formatTimeAMPM(
                                todaySchedule.endTime || todaySchedule.toTime
                              )}`
                            : "No Shift"}
                        </h3>
                        <p className="text-[12px] text-slate-500">
                          {todaySchedule
                            ? "Scheduled for today"
                            : "No schedule assigned"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(148,163,184,0.12)]">
                <div className="rounded-[24px] border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-5">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-[24px] border border-sky-100 bg-white p-2 shadow-sm">
                      <img
                        className="h-[170px] w-[170px] rounded-[22px] object-cover"
                        src={`/photos/${empData.user?.employeeId}.png`}
                        onError={(e) => (e.target.src = "/default-profile.png")}
                        alt="Profile"
                      />
                    </div>

                    <h3 className="mt-4 text-[24px] font-bold text-slate-900">
                      {empData.user?.name || "-"}
                    </h3>

                    <p className="mt-1 text-[14px] text-slate-600">
                      {empData.user?.designation || "-"} •{" "}
                      {empData.user?.department || "-"}
                    </p>

                    <span className="mt-4 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[12px] font-semibold text-emerald-700">
                      Active Employee
                    </span>

                    
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_32px_rgba(148,163,184,0.12)]">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-[24px] font-bold text-slate-900">
                      My Profile
                    </h3>
                    <p className="mt-1 text-[14px] text-slate-500">
                      Personal and work-related information.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-[13px] font-medium text-sky-700">
                    <FiUser className="text-[15px]" />
                    Employee Details
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {infoCards.map((item, index) => (
                    <div
                      key={index}
                      className={`rounded-[20px] border border-slate-200 bg-slate-50/70 p-4 transition hover:-translate-y-[2px] hover:border-sky-200 hover:bg-white hover:shadow-sm ${
                        item.wide ? "md:col-span-2 2xl:col-span-1" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-[18px] text-sky-700">
                          {item.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-slate-500">
                            {item.label}
                          </p>
                          <p
                            className={`mt-2 text-[15px] font-semibold text-slate-900 ${
                              item.breakAll ? "break-all" : ""
                            }`}
                          >
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;
