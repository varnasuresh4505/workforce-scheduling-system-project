import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Popup from "../components/Popup";
import { API_BASE_URL } from "../services/api";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiUsers,
  FiMail,
  FiBriefcase,
} from "react-icons/fi";

function Employees() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [pop, setPop] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    department: "",
    designation: "",
    age: "",
    dob: "",
    address: "",
    mobile: "",
    email: "",
    password: "",
    gender: "",
  });

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    employeeId: "",
    name: "",
    department: "",
    designation: "",
    age: "",
    dob: "",
    address: "",
    mobile: "",
    email: "",
    gender: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchEmployees();
    // eslint-disable-next-line
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/employees/with-hours`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: err.response?.data?.message || "Failed to fetch employees",
      });
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return employees;

    return employees.filter((e) => {
      return (
        e.name?.toLowerCase().includes(q) ||
        e.employeeId?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.designation?.toLowerCase().includes(q)
      );
    });
  }, [employees, search]);

  const totalDepartments = useMemo(() => {
    return new Set(
      employees.map((e) => (e.department || "").trim()).filter(Boolean)
    ).size;
  }, [employees]);

  const openAdd = () => {
    setForm({
      employeeId: "",
      name: "",
      department: "",
      designation: "",
      age: "",
      dob: "",
      address: "",
      mobile: "",
      email: "",
      password: "",
      gender: "",
    });
    setAddOpen(true);
  };

  const addEmployee = async () => {
    try {
      await axios.post(`${API_BASE_URL}/employees`, form, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setAddOpen(false);
      setPop({
        open: true,
        type: "success",
        message: "Employee created successfully",
      });
      fetchEmployees();
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: err.response?.data?.message || "Failed to add employee",
      });
    }
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setEditForm({
      employeeId: emp.employeeId || "",
      name: emp.name || "",
      department: emp.department || "",
      designation: emp.designation || "",
      age: emp.age || "",
      dob: emp.dob ? new Date(emp.dob).toISOString().split("T")[0] : "",
      address: emp.address || "",
      mobile: emp.mobile || "",
      email: emp.email || "",
      gender: emp.gender || "",
    });
  };

  const saveEdit = async () => {
    try {
      await axios.put(`${API_BASE_URL}/employees/${editing._id}`, editForm, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setEditing(null);
      setPop({
        open: true,
        type: "success",
        message: "Employee updated successfully",
      });
      fetchEmployees();
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: err.response?.data?.message || "Failed to update employee",
      });
    }
  };

  const removeEmployee = async (id) => {
    const ok = window.confirm("Delete this employee?");
    if (!ok) return;

    try {
      await axios.delete(`${API_BASE_URL}/employees/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setPop({
        open: true,
        type: "success",
        message: "Employee deleted successfully",
      });
      fetchEmployees();
    } catch (err) {
      setPop({
        open: true,
        type: "error",
        message: err.response?.data?.message || "Failed to delete employee",
      });
    }
  };

  const pad2 = (n) => String(n).padStart(2, "0");

  const formatDDMMYYYY = (dateValue) => {
    if (!dateValue) return "-";
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "-";
    return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
  };

  const inputClass =
    "h-[42px] rounded-[12px] border border-slate-300 bg-white px-3 text-[14px] text-slate-900 outline-none focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.08)]";

  return (
    <Layout>
      <Popup
        open={pop.open}
        type={pop.type}
        message={pop.message}
        onClose={() => setPop({ ...pop, open: false })}
      />

      <div className="min-h-screen bg-slate-50 p-4 font-['Poppins',sans-serif]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-slate-900">
              Employees
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Manage all hospital staff in one place
            </p>
          </div>

          <button
            className="inline-flex h-[42px] items-center gap-2 rounded-[12px] bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            onClick={openAdd}
            type="button"
          >
            <FiPlus />
            Add Employee
          </button>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-medium text-slate-500">
                  Total Employees
                </p>
                <h3 className="mt-2 text-[26px] font-bold text-slate-900">
                  {employees.length}
                </h3>
              </div>
              <div className="rounded-[12px] bg-slate-100 p-3 text-slate-700">
                <FiUsers size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-medium text-slate-500">
                  Departments
                </p>
                <h3 className="mt-2 text-[26px] font-bold text-slate-900">
                  {totalDepartments}
                </h3>
              </div>
              <div className="rounded-[12px] bg-slate-100 p-3 text-slate-700">
                <FiBriefcase size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-medium text-slate-500">
                  Today Present
                </p>
                <h3 className="mt-2 text-[26px] font-bold text-slate-900">
                  {filtered.length}
                </h3>
              </div>
              <div className="rounded-[12px] bg-slate-100 p-3 text-slate-700">
                <FiMail size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-[10px] rounded-[14px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <FiSearch className="text-[16px] text-slate-500" />
          <input
            className="w-full border-none bg-transparent text-[14px] text-slate-900 outline-none"
            placeholder="Search by ID, name, department, designation or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <div className="overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-[1200px] border-collapse">
              <thead>
                <tr className="bg-slate-900">
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Employee
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Staff ID
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Department
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Designation
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Contact
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    DOB
                  </th>
                  <th className="px-4 py-4 text-left text-[13px] font-semibold text-white">
                    Hours
                  </th>
                  <th className="px-4 py-4 text-center text-[13px] font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((u, index) => (
                  <tr
                    key={u._id}
                    className={`border-t border-slate-200 transition hover:bg-slate-50 ${
                      index % 2 !== 0 ? "bg-slate-50/60" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          className="h-[46px] w-[46px] rounded-full border border-slate-200 bg-slate-100 object-cover"
                          src={`/photos/${u.employeeId}.png`}
                          onError={(e) => (e.target.src = "/default-profile.png")}
                          alt="Profile"
                        />
                        <div>
                          <div className="text-[14px] font-semibold text-slate-900">
                            {u.name || "-"}
                          </div>
                          <div className="text-[12px] text-slate-500">
                            {u.email || "-"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-[14px] font-medium text-slate-800">
                      {u.employeeId || "-"}
                    </td>

                    <td className="px-4 py-4 text-[14px] text-slate-700">
                      {u.department || "-"}
                    </td>

                    <td className="px-4 py-4 text-[14px] text-slate-700">
                      {u.designation || "-"}
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-[14px] text-slate-800">
                        {u.mobile || "-"}
                      </div>
                      
                    </td>

                    <td className="px-4 py-4 text-[14px] text-slate-700">
                      {formatDDMMYYYY(u.dob)}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-700">
                        {u.totalHours ? `${u.totalHours} hrs` : "0.00 hrs"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="grid h-[36px] w-[36px] place-items-center rounded-[10px] border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                          onClick={() => openEdit(u)}
                          type="button"
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          className="grid h-[36px] w-[36px] place-items-center rounded-[10px] border border-slate-200 bg-white text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={() => removeEmployee(u._id)}
                          type="button"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-10 text-center text-[14px] text-slate-500"
                    >
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>


        {addOpen && (
          <div
            className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-950/45 px-4"
            onClick={() => setAddOpen(false)}
          >
            <div
              className="w-[720px] max-w-[96vw] rounded-[18px] border border-slate-200 bg-white p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[18px] font-bold text-slate-900">
                  Add Employee
                </h3>
                <button
                  className="grid h-[36px] w-[36px] place-items-center rounded-[10px] border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  onClick={() => setAddOpen(false)}
                  type="button"
                >
                  <FiX />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  className={inputClass}
                  value={form.employeeId}
                  onChange={(e) =>
                    setForm({ ...form, employeeId: e.target.value })
                  }
                  placeholder="Staff ID"
                />
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Name"
                />
                <input
                  className={inputClass}
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                  placeholder="Department"
                />
                <input
                  className={inputClass}
                  value={form.designation}
                  onChange={(e) =>
                    setForm({ ...form, designation: e.target.value })
                  }
                  placeholder="Designation"
                />
                <select
                  className={inputClass}
                  value={form.gender || ""}
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="date"
                  className={inputClass}
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
                <input
                  className={`${inputClass} md:col-span-2`}
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Address"
                />
                <input
                  className={inputClass}
                  value={form.mobile}
                  onChange={(e) =>
                    setForm({ ...form, mobile: e.target.value })
                  }
                  placeholder="Mobile Number"
                />
                <input
                  className={inputClass}
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="Email"
                />
                <input
                  type="password"
                  className={`${inputClass} md:col-span-2`}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Password"
                />
              </div>

              <div className="mt-4 flex justify-end gap-[10px]">
                <button
                  className="h-[42px] rounded-[12px] bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                  onClick={addEmployee}
                  type="button"
                >
                  Create
                </button>
                <button
                  className="h-[42px] rounded-[12px] bg-slate-300 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-400"
                  onClick={() => setAddOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {editing && (
          <div
            className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-950/45 px-4"
            onClick={() => setEditing(null)}
          >
            <div
              className="w-[720px] max-w-[96vw] rounded-[18px] border border-slate-200 bg-white p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[18px] font-bold text-slate-900">
                  Edit Employee
                </h3>
                <button
                  className="grid h-[36px] w-[36px] place-items-center rounded-[10px] border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  onClick={() => setEditing(null)}
                  type="button"
                >
                  <FiX />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  className={inputClass}
                  placeholder="Staff ID"
                  value={editForm.employeeId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, employeeId: e.target.value })
                  }
                />
                <input
                  className={inputClass}
                  placeholder="Name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
                <input
                  className={inputClass}
                  placeholder="Department"
                  value={editForm.department}
                  onChange={(e) =>
                    setEditForm({ ...editForm, department: e.target.value })
                  }
                />
                <input
                  className={inputClass}
                  placeholder="Designation"
                  value={editForm.designation}
                  onChange={(e) =>
                    setEditForm({ ...editForm, designation: e.target.value })
                  }
                />
                <select
                  className={inputClass}
                  value={editForm.gender}
                  onChange={(e) =>
                    setEditForm({ ...editForm, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="date"
                  className={inputClass}
                  value={editForm.dob}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dob: e.target.value })
                  }
                />
                <input
                  className={inputClass}
                  placeholder="Address"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                />
                <input
                  className={inputClass}
                  placeholder="Contact"
                  value={editForm.mobile}
                  onChange={(e) =>
                    setEditForm({ ...editForm, mobile: e.target.value })
                  }
                />
                <input
                  className={`${inputClass} md:col-span-2`}
                  placeholder="Email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>

              <div className="mt-4 flex justify-end gap-[10px]">
                <button
                  className="h-[42px] rounded-[12px] bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                  onClick={saveEdit}
                  type="button"
                >
                  Save
                </button>
                <button
                  className="h-[42px] rounded-[12px] bg-slate-300 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-400"
                  onClick={() => setEditing(null)}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Employees;
