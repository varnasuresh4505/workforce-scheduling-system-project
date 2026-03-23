import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUsers, FaSignOutAlt, FaCalendarAlt, FaClipboardList, FaClock } from "react-icons/fa";
import { Hospital } from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  if (!user) return null;

  const linkClass = ({ isActive }) =>
    `flex w-full cursor-pointer items-center gap-[15px] rounded-[8px] border-none px-3 py-3 text-left text-[16px] text-white no-underline transition-colors ${
      isActive ? "bg-slate-700 font-bold" : "bg-transparent font-normal"
    }`;

  return (
  <>
    {/* Top Navbar */}
    <div className="fixed top-0 left-0 w-full h-[70px] bg-slate-800 text-white flex items-center justify-between px-6 z-50 shadow-md">
      <div className="flex items-center gap-2 font-semibold text-[22px]">
        <Hospital size={42} />
        <span>SVT  Hospital  Management  System</span>
      </div>

      <div className="flex items-center gap-7 text-sm">
        <span>Welcome, {user?.name || "User"} 👋</span>

        <button
          className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded hover:bg-slate-600"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>

    {/* Sidebar */}
    <div className="sticky top-[45px] flex h-[calc(100vh-45px)] w-[250px] flex-col overflow-hidden bg-slate-800 px-[20px] pr-[40px] py-[20px] text-white">

      

      <ul className="m-0 flex-1 list-none overflow-y-auto p-0">
        <li className="mb-5 mt-10">
          <NavLink to="/dashboard" className={linkClass}>
            <FaCalendarAlt className="text-[20px]" />
            <span>Dashboard</span>
          </NavLink>
        </li>

        {user?.role === "admin" && (
          <>
            <li className="mb-5">
              <NavLink to="/employees" className={linkClass}>
                <FaUsers className="text-[20px]" />
                <span>Employees</span>
              </NavLink>
            </li>

            <li className="mb-5">
              <NavLink to="/leaves" className={linkClass}>
                <FaClipboardList className="text-[20px]" />
                <span>Leave Requests</span>
              </NavLink>
            </li>

            <li className="mb-5">
              <NavLink to="/shifts" className={linkClass}>
                <FaClock className="text-[20px]" />
                <span>Shift Planner</span>
              </NavLink>
            </li>
          </>
        )}

        {user?.role === "employee" && (
          <>
            <li className="mb-5">
              <NavLink to="/my-schedule" className={linkClass}>
                <FaClock className="text-[20px]" />
                <span>My Schedule</span>
              </NavLink>
            </li>

            <li className="mb-5">
              <NavLink to="/apply-leave" className={linkClass}>
                <FaClipboardList className="text-[20px]" />
                <span>Apply Leave</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>

      <div className="mt-auto mb-0 border-t border-white/20 pb-3 pt-3 text-center text-[12px] opacity-90">
        <p className="m-0 font-semibold">💙 Caring Beyond Medicine 💙</p>
        <small className="mt-[3px] mb-[15px] block text-[11px] text-slate-300">
          Healing with Compassion & Trust
        </small>
      </div>
    </div>
  </>
);
}

export default Sidebar;