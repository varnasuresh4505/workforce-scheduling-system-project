import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { MdDashboard } from "react-icons/md";
import {
  FaUsers,
  FaSignOutAlt,
  FaCalendarAlt,
  FaClipboardList,
  FaClock,
} from "react-icons/fa";
import { Hospital } from "lucide-react";


function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  if (!user) return null;

  // ✅ Active link class
  const linkClass = ({ isActive }) =>
    isActive ? "side-link active" : "side-link";

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">
        <Hospital size={30} className="logo-icon" />
        VV Hospital
      </h2>

      <ul className="sidebar-menu">
        {/* Dashboard */}
        <li>
          <NavLink to="/dashboard" className={linkClass}>
            <MdDashboard className="side-icon" />
            <span>Dashboard</span>
          </NavLink>
        </li>

        {/* Admin links */}
        {user?.role === "admin" && (
          <>
            <li>
              <NavLink to="/employees" className={linkClass}>
                <FaUsers className="side-icon" />
                <span>Employees</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/shifts" className={linkClass}>
                <FaClock className="side-icon" />
                <span>Shifts</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/schedules" className={linkClass}>
                <FaCalendarAlt className="side-icon" />
                <span>Schedules</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/leaves" className={linkClass}>
                <FaClipboardList className="side-icon" />
                <span>Leave Requests</span>
              </NavLink>
            </li>
          </>
        )}

        {/* Employee links */}
        {user?.role === "employee" && (
          <>
            <li>
              <NavLink to="/my-schedule" className={linkClass}>
                <FaCalendarAlt className="side-icon" />
                <span>My Schedule</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/apply-leave" className={linkClass}>
                <FaClipboardList className="side-icon" />
                <span>Apply Leave</span>
              </NavLink>
            </li>
          </>
        )}

        {/* Logout */}
        <li>
          <button className="side-link logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="side-icon" />
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
