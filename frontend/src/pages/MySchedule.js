import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MySchedule.css";
import Layout from "../components/Layout"; // ✅ add this

function MySchedule() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

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
      alert("Failed to load your schedule");
    }
  };

  const formatTime = (time) => {
  const [hour, minute] = time.split(":");
  const h = parseInt(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHour = h % 12 || 12;
  return `${formattedHour}:${minute} ${ampm}`;
};

  return (
    <Layout>
    <div className="my-container">
      <h2>My Schedule</h2>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Assigned By</th>
          </tr>
        </thead>

        <tbody>
          {mySchedules.map((s) => (
            <tr key={s._id}>
              <td>{new Date(s.date).toLocaleDateString()}</td>
              <td>{formatTime(s.fromTime)} - {formatTime(s.toTime)}</td>
              <td>{s.assignedBy?.name || "-"}</td>
            </tr>
          ))}

          {mySchedules.length === 0 && (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                No schedule assigned yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </Layout>
  );
}

export default MySchedule;