import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaSignOutAlt,
  FaCalendarAlt,
  FaClipboardList,
  FaClock,
} from "react-icons/fa";
import { HeartPulse } from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  if (!user) return null;

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-all duration-200 ${
      isActive
        ? "bg-white text-slate-900 shadow-sm"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <>
      <header className="fixed left-0 top-0 z-50 flex h-[72px] w-full items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-800">
            <HeartPulse size={23} />
          </div>

          <div>
            <h1 className="text-[18px] font-bold text-slate-900">
              SVT Hospital
            </h1>
            <p className="text-[12px] text-slate-500">
              Workforce Scheduling System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right md:block">
            <p className="text-[14px] font-semibold text-slate-900">
              {user?.name || "User"}
            </p>
            <p className="text-[12px] capitalize text-slate-500">
              {user?.role || "user"}
            </p>
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[14px] font-medium text-white transition hover:bg-slate-800"
            onClick={handleLogout}
            type="button"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </header>

      <aside className="fixed left-0 top-[72px] z-40 h-[calc(100vh-72px)] w-[250px] bg-slate-900 px-4 py-5">
        <div className="mb-6 border-b border-white/10 pb-4">
          <p className="text-[12px] uppercase tracking-[0.16em] text-slate-400">
            SVT Care Hub
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink to="/dashboard" className={linkClass}>
            <FaCalendarAlt className="text-[16px]" />
            <span>Dashboard</span>
          </NavLink>

          {user?.role === "admin" && (
            <>
              <NavLink to="/employees" className={linkClass}>
                <FaUsers className="text-[16px]" />
                <span>Employees</span>
              </NavLink>

              <NavLink to="/leaves" className={linkClass}>
                <FaClipboardList className="text-[16px]" />
                <span>Leave Requests</span>
              </NavLink>

              <NavLink to="/shifts" className={linkClass}>
                <FaClock className="text-[16px]" />
                <span>Shift Planner</span>
              </NavLink>
            </>
          )}

          {user?.role === "employee" && (
            <>
              <NavLink to="/my-schedule" className={linkClass}>
                <FaClock className="text-[16px]" />
                <span>My Schedule</span>
              </NavLink>

              <NavLink to="/apply-leave" className={linkClass}>
                <FaClipboardList className="text-[16px]" />
                <span>Apply Leave</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[13px] font-semibold text-white">
            Hospital Workforce
          </p>
          <p className="mt-1 text-[11px] leading-5 text-slate-300">
            Stay Tuned for the Latest Updates and Schedules
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;