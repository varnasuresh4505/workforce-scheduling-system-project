import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Popup from "../components/Popup";
import "./MySchedule.css";

const pad2 = (n) => String(n).padStart(2, "0");
const formatDDMMYYYY = (dateValue) => {
  const d = new Date(dateValue);
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
};

const formatAMPM = (time) => {
  if (!time) return "-";
  const [hh, mm] = String(time).split(":");
  const h = parseInt(hh, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${pad2(hour12)}:${mm}${ampm}`;
};

function MySchedule() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [pop, setPop] = useState({ open: false, type: "success", message: "" });
  const [mySchedules, setMySchedules] = useState([]);

  useEffect(() => {
    if (!user) return navigate("/");
    fetchMySchedules();
    // eslint-disable-next-line
  }, []);

  const fetchMySchedules = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/schedules/my", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMySchedules(res.data);
    } catch (err) {
      setPop({ open: true, type: "error", message: "Failed to load your schedule" });
    }
  };

  const pad2 = (n) => String(n).padStart(2, "0");
  const formatDDMMYYYY = (dateValue) => {
  const d = new Date(dateValue);
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
};

  return (
    <Layout>
      <Popup open={pop.open} type={pop.type} message={pop.message} onClose={() => setPop({ ...pop, open: false })} />

      <div className="myPg">
        <div className="vvDash-topbar">
          <div className="vvDash-title">My Schedule</div>
          <div className="vvDash-welcome">Welcome, {user?.name} !</div>
        </div>

        <div className="myCard">
          <div className="myTableWrap hideScroll">
            <table className="myTable">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Assigned By</th>
                </tr>
              </thead>
              <tbody>
                {mySchedules.map((s) => (
                  <tr key={s._id}>
                    <td>{s.employeeId}</td>
                    <td>{s.employeeName}</td>
                    <td>{formatDDMMYYYY(s.date)}</td>
                    <td>{formatAMPM(s.fromTime)} - {formatAMPM(s.toTime)}</td>
                    <td>{s.assignedBy?.name || "-"}</td>
                  </tr>
                ))}

                {mySchedules.length === 0 && (
                  <tr>
                    <td colSpan="5" className="myEmpty">No schedule assigned yet</td>
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