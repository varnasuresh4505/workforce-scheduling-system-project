import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  // if user not loaded yet
  if (!user) return null;

  return (
    <div className="sidebar">
      <h2>VV Hospital</h2>

      <ul>
        <li>
          <NavLink to="/dashboard" className="side-link">
            Dashboard
          </NavLink>
        </li>

        {user?.role === "admin" && (
          <>
            <li>
              <NavLink to="/employees" className="side-link">
                Employees
              </NavLink>
            </li>
            <li>
              <NavLink to="/shifts" className="side-link">
                Shifts
              </NavLink>
            </li>
            <li>
              <NavLink to="/schedules" className="side-link">
                Schedules
              </NavLink>
            </li>
            <li>
              <NavLink to="/leaves" className="side-link">
                Leave Requests
              </NavLink>
            </li>
          </>
        )}

        {user?.role === "employee" && (
          <>
            <li>
              <NavLink to="/my-schedule" className="side-link">
                My Schedule
              </NavLink>
            </li>
            <li>
              <NavLink to="/apply-leave" className="side-link">
                Apply Leave
              </NavLink>
            </li>
          </>
        )}

        <li>
          <button className="side-link logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;