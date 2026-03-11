import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "./LeavesAdmin.css";
import { FiSearch } from "react-icons/fi";

const pad2 = (n) => String(n).padStart(2, "0");

const formatDDMMYYYY = (dateValue) => {
  const d = new Date(dateValue);
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
};

const formatTimeAMPM = (time) => {
  if (!time) return "-";
  const t = String(time).trim();

  // if already has AM/PM
  if (/am|pm/i.test(t)) return t.replace(/\s+/g, " ").toUpperCase();

  const [hh, mm = "00"] = t.split(":");
  const h = parseInt(hh, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${pad2(hour12)}:${mm} ${ampm}`;
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

  // ✅ Search filter (no functionality change)
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
      <div className="vvLeave-page">
        {/* ✅ TOP BAR (like schedules header) */}
        <div className="vvLeave-top">
          <div className="vvLeave-welcomeRow">
            <div className="vvLeave-title">Leave Requests</div>
          </div>

          {/* ✅ Search */}
          <div className="vvLeave-searchRow">
            <FiSearch className="vvLeave-searchIcon" />
            <input
              className="vvLeave-searchInput"
              placeholder="Search staff id / name / email / date"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ✅ Card like schedules */}
        <div className="vvLeave-card">
          <div className="vvLeave-cardHead">
            <h3 className="vvLeave-cardTitle">Leave List</h3>
            <span className="vvLeave-badge">{tableRows.length} Records</span>
          </div>

          <div className="vvLeave-tableWrap">
            <table className="vvLeave-table">
              <thead>
                <tr>
                  <th>Emp ID</th>
                  <th>Employee</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {tableRows.map((l) => (
                  <tr key={l._id}>
                    <td>{l.employee?.employeeId || "-"}</td>

                    <td>
                      {l.employee?.name || "-"}
                      <br />
                      <small>{l.employee?.email || ""}</small>
                    </td>

                    <td>{formatDDMMYYYY(l.fromDate)}</td>
                    <td>{formatDDMMYYYY(l.toDate)}</td>

                    <td>
                      {formatTimeAMPM(l.startTime)} - {formatTimeAMPM(l.endTime)}
                    </td>

                    <td>{l.reason || "-"}</td>

                    <td>
                      <span
                        className={`vvLeave-status ${String(
                          l.status || ""
                        ).toLowerCase()}`}
                      >
                        {l.status}
                      </span>
                    </td>

                    <td>
                      <div className="vvLeave-actions">
                        <button
                          className="vvLeave-approve"
                          onClick={() => updateStatus(l._id, "approved")}
                          type="button"
                        >
                          Approve
                        </button>
                        <button
                          className="vvLeave-reject"
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
                    <td colSpan="8" className="vvLeave-empty">
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