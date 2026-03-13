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
    <div className="sticky top-0 flex h-screen w-[280px] flex-col overflow-hidden bg-slate-800 px-[20px] pr-[40px] py-[20px] text-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <h2 className="mb-[25px] mt-[28px] flex items-center justify-center gap-[10px] text-center text-[26px] font-bold">
        <Hospital size={28} className="shrink-0" />
        <span>SVT Hospital</span>
      </h2>

      <ul className="m-0 flex-1 list-none overflow-y-auto p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <li className="mb-5">
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

        <li className="mb-5">
          <button
            className="flex w-full cursor-pointer items-center gap-[15px] rounded-[8px] border-none bg-transparent px-3 py-3 text-left text-[16px] text-white transition-colors"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="text-[20px]" />
            <span>Logout</span>
          </button>
        </li>
      </ul>

      <div className="mt-auto border-t border-white/20 pb-3 pt-3 text-center text-[14px] opacity-90">
        <p className="m-0 font-semibold">💙 Caring Beyond Medicine 💙</p>
        <small className="mt-[3px] mb-[15px] block text-[12px] text-slate-300">
          Healing with Compassion & Trust
        </small>
      </div>
    </div>
  );
}

export default Sidebar;