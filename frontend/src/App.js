import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import ShiftsPlanner from "./pages/ShiftsPlanner";
import Schedules from "./pages/Schedules";
import LeavesAdmin from "./pages/LeavesAdmin";
import ApplyLeave from "./pages/ApplyLeave";
import MySchedule from "./pages/MySchedule";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/dashboard" element={<Dashboard />} />

      {/* Admin */}
      <Route path="/employees" element={<Employees />} />
      <Route path="/shifts" element={<ShiftsPlanner />} />
      <Route path="/schedules" element={<Schedules />} />
      <Route path="/leaves" element={<LeavesAdmin />} />

      {/* Employee */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/my-schedule" element={<MySchedule />} />
      <Route path="/apply-leave" element={<ApplyLeave />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;