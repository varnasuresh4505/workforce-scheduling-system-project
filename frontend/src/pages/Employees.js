import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Popup from "../components/Popup";
import { FiSearch, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

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
      const res = await axios.get(
        "http://localhost:5000/api/employees/with-hours",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
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

  const groupedEmployees = useMemo(() => {
    return filtered.reduce((acc, emp) => {
      const dept = emp.department?.trim() || "No Department";
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(emp);
      return acc;
    }, {});
  }, [filtered]);

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
      await axios.post("http://localhost:5000/api/employees", form, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setAddOpen(false);
      setPop({
        open: true,
        type: "success",
        message: "Staff/Employee created successfully ✅",
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
      await axios.put(
        `http://localhost:5000/api/employees/${editing._id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setEditing(null);
      setPop({
        open: true,
        type: "success",
        message: "Employee updated successfully ✅",
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
      await axios.delete(`http://localhost:5000/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setPop({
        open: true,
        type: "success",
        message: "Employee deleted ✅",
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

  const baseInputClass =
    "h-[52px] rounded-[14px] border border-slate-300 bg-white px-4 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:shadow-[0_0_0_4px_rgba(15,23,42,0.1)]";

  const editInputClass =
    "h-[44px] rounded-[10px] border border-slate-300 bg-white px-3 text-[14px] text-slate-900 outline-none focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]";

  return (
    <Layout>
      <Popup
        open={pop.open}
        type={pop.type}
        message={pop.message}
        onClose={() => setPop({ ...pop, open: false })}
      />

      <div className="mt-[52px] h-screen overflow-hidden bg-slate-100 px-[22px] py-[18px] font-['Poppins',sans-serif]">
        <div className="sticky top-0 z-50 flex items-center justify-between bg-slate-100 pb-[14px] pt-[25px]">
          <div>
            <div className="m-0 text-[20px] font-extrabold text-slate-900">
              Employees
            </div>
            <div className="mt-1 text-[13px] text-slate-500">
              Search and manage hospital staff
            </div>
          </div>

          <button
            className="inline-flex h-[42px] items-center gap-2 rounded-[10px] border-none bg-slate-900 px-[14px] font-bold text-white"
            onClick={openAdd}
            type="button"
          >
            <FiPlus />
            Add Employee
          </button>
        </div>

        <div className="mb-4 flex items-center gap-[10px] rounded-[14px] border border-gray-200 bg-white px-[14px] py-3 shadow-[0px_6px_18px_rgba(15,23,42,0.06)] focus-within:border-slate-900 focus-within:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]">
          <FiSearch className="text-[18px] text-slate-500" />
          <input
            className="w-full border-none bg-transparent text-[14px] text-slate-900 outline-none"
            placeholder="Search staff id / name / dept / designation / email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-3">
            
          </div>
        )}

        <div className="h-[calc(100vh-190px)] overflow-auto pr-[2px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filtered.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-slate-300 bg-white p-4 text-center text-slate-500">
              No employees found
            </div>
          ) : (
            Object.entries(groupedEmployees).map(([department, deptEmployees]) => (
              <div
                key={department}
                className="mb-6 rounded-[18px] border border-slate-200 bg-white/70 p-4 shadow-[0px_8px_24px_rgba(15,23,42,0.06)]"
              >
                <div className="mb-4 flex items-center justify-between rounded-[14px] bg-slate-900 px-4 py-3 text-white">
                  <div>
                    <div className="text-[18px] font-bold">{department}</div>
                    <div className="text-[12px] text-slate-300">
                      Department wise employee list
                    </div>
                  </div>

                  <div className="rounded-full bg-white/15 px-4 py-2 text-[13px] font-semibold">
                    {deptEmployees.length} Employee
                    {deptEmployees.length > 1 ? "s" : ""}
                  </div>
                </div>

                <div className="space-y-4">
                  {deptEmployees.map((u) => (
                    <div
                      key={u._id}
                      className="grid grid-cols-1 items-start gap-[30px] rounded-[14px] border border-gray-200 bg-white p-[18px] shadow-[0px_6px_18px_rgba(15,23,42,0.08)] lg:grid-cols-[140px_1fr]"
                    >
                      <div className="flex items-start justify-center pt-[10px]">
                        <img
                          className="h-[120px] w-[120px] rounded-[12px] border border-gray-200 bg-slate-100 object-cover"
                          src={`/photos/${u.employeeId}.png`}
                          onError={(e) => (e.target.src = "/default-profile.png")}
                          alt="Profile"
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-[10px]">
                            <div className="text-[18px] font-bold text-slate-900">
                              {u.name}
                            </div>
                            <span
                              className="inline-block h-[10px] w-[10px] rounded-full bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.2)]"
                              title="Active"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              className="grid h-[34px] w-[34px] place-items-center rounded-[10px] border border-gray-200 bg-slate-50 transition hover:bg-indigo-50"
                              onClick={() => openEdit(u)}
                              type="button"
                            >
                              <FiEdit2 />
                            </button>

                            <button
                              className="grid h-[34px] w-[34px] place-items-center rounded-[10px] border border-gray-200 bg-slate-50 transition hover:border-red-200 hover:bg-red-100 hover:text-red-700"
                              onClick={() => removeEmployee(u._id)}
                              type="button"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-x-[18px] gap-y-5 md:grid-cols-2 xl:grid-cols-3">
                          <div>
                            <div className="mb-1 text-[12px] font-semibold text-slate-500">
                              Staff ID
                            </div>
                            <div className="text-[14px] font-medium text-slate-900">
                              {u.employeeId || "-"}
                            </div>
                          </div>

                          <div>
                            <div className="mb-1 text-[12px] font-semibold text-slate-500">
                              Staff Name
                            </div>
                            <div className="text-[14px] font-medium text-slate-900">
                              {u.name || "-"}
                            </div>
                          </div>

                          <div>
                            <div className="mb-1 text-[12px] font-semibold text-slate-500">
                              Department
                            </div>
                            <div className="text-[14px] font-medium text-slate-900">
                              {u.department || "-"}
                            </div>
                          </div>

                          <div>
                            <div className="mb-1 text-[12px] font-semibold text-slate-500">
                              Designation
                            </div>
                            <div className="text-[14px] font-medium text-slate-900">
                              {u.designation || "-"}
                            </div>
                          </div>

                          <div>
                            <div className="mb-1 text-[12px] font-semibold text-slate-500">
                              Email
                            </div>
                            <div className="text-[14px] font-medium text-slate-900">
                              {u.email || "-"}
                            </div>
                          </div>

                          <div>
                            <div className="mb-1 text-[12px] font-semibold text-slate-500">
                              Contact
                            </div>
                            <div className="text-[14px] font-medium text-slate-900">
                              {u.mobile || "-"}
                            </div>
                          </div>

                          <div>
                            <div className="mb-1 text-[12px] font-semibold text-slate-500">
                              Gender
                            </div>
                            <div className="text-[14px] font-medium text-slate-900">
                              {u.gender || "-"}
                            </div>
                          </div>

                          <div>
                            <div className="mb-1 text-[12px] font-semibold text-slate-500">
                              Date of Birth
                            </div>
                            <div className="text-[14px] font-medium text-slate-900">
                              {formatDDMMYYYY(u.dob)}
                            </div>
                          </div>

                          <div>
                            <div className="mb-1 text-[12px] font-semibold text-slate-500">
                              Total Hours (This Week)
                            </div>
                            <div className="text-[14px] font-medium text-slate-900">
                              {u.totalHours ? `${u.totalHours} hrs` : "0.00 hrs"}
                            </div>
                          </div>

                          <div className="md:col-span-2 xl:col-span-3">
                            <div className="mb-1 text-[12px] font-semibold text-slate-500">
                              Address
                            </div>
                            <div className="text-[14px] font-medium text-slate-900">
                              {u.address || "-"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {addOpen && (
          <div
            className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-950/45"
            onClick={() => setAddOpen(false)}
          >
            <div
              className="w-[600px] max-w-[96vw] rounded-[18px] border border-gray-200 bg-white p-[22px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="m-0 text-[20px] font-extrabold text-slate-900">
                  Add Employee
                </h3>
                <button
                  className="h-[44px] w-[44px] rounded-[14px] border border-gray-200 bg-slate-50 text-[18px] text-slate-900 transition hover:bg-indigo-50"
                  onClick={() => setAddOpen(false)}
                  type="button"
                >
                  ✕
                </button>
              </div>

              <div className="mt-[10px] grid grid-cols-1 gap-x-[22px] gap-y-[18px] md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-slate-700">
                    Staff ID
                  </label>
                  <input
                    className={baseInputClass}
                    value={form.employeeId}
                    onChange={(e) =>
                      setForm({ ...form, employeeId: e.target.value })
                    }
                    placeholder="Enter Staff ID"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-slate-700">
                    Name
                  </label>
                  <input
                    className={baseInputClass}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter Name"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-slate-700">
                    Department
                  </label>
                  <input
                    className={baseInputClass}
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                    placeholder="Enter Department"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-slate-700">
                    Designation
                  </label>
                  <input
                    className={baseInputClass}
                    value={form.designation}
                    onChange={(e) =>
                      setForm({ ...form, designation: e.target.value })
                    }
                    placeholder="Enter Designation"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-slate-700">
                    Gender
                  </label>
                  <select
                    className={baseInputClass}
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
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-slate-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className={`${baseInputClass} text-slate-500`}
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-[13px] font-semibold text-slate-700">
                    Address
                  </label>
                  <input
                    className={baseInputClass}
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder="Enter Address"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-slate-700">
                    Contact
                  </label>
                  <input
                    className={baseInputClass}
                    value={form.mobile}
                    onChange={(e) =>
                      setForm({ ...form, mobile: e.target.value })
                    }
                    placeholder="Enter Contact Number"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    className={baseInputClass}
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="Enter Email"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    className={baseInputClass}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Enter Password"
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-[10px]">
                <button
                  className="h-[44px] rounded-[10px] bg-slate-900 px-[14px] font-bold text-white"
                  onClick={addEmployee}
                  type="button"
                >
                  Create
                </button>

                <button
                  className="h-[44px] rounded-[10px] bg-slate-400 px-[14px] font-bold text-white"
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
            className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-950/45"
            onClick={() => setEditing(null)}
          >
            <div
              className="w-[680px] max-w-[94vw] rounded-[14px] border border-gray-200 bg-white p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-[10px] text-[16px] font-extrabold text-slate-800">
                Edit Employee
              </div>

              <div className="grid grid-cols-1 gap-[10px] md:grid-cols-2">
                <input
                  className={editInputClass}
                  placeholder="Staff ID"
                  value={editForm.employeeId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, employeeId: e.target.value })
                  }
                />

                <input
                  className={editInputClass}
                  placeholder="Name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />

                <input
                  className={editInputClass}
                  placeholder="Department"
                  value={editForm.department}
                  onChange={(e) =>
                    setEditForm({ ...editForm, department: e.target.value })
                  }
                />

                <input
                  className={editInputClass}
                  placeholder="Designation"
                  value={editForm.designation}
                  onChange={(e) =>
                    setEditForm({ ...editForm, designation: e.target.value })
                  }
                />

                <select
                  className={`${editInputClass} text-slate-500`}
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
                  className={`${editInputClass} text-slate-500`}
                  value={editForm.dob}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dob: e.target.value })
                  }
                />

                <input
                  className={editInputClass}
                  placeholder="Address"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                />

                <input
                  className={editInputClass}
                  placeholder="Contact"
                  value={editForm.mobile}
                  onChange={(e) =>
                    setEditForm({ ...editForm, mobile: e.target.value })
                  }
                />

                <input
                  className={editInputClass}
                  placeholder="Mail"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>

              <div className="mt-3 flex justify-end gap-[10px]">
                <button
                  className="h-[44px] rounded-[10px] bg-slate-900 px-[14px] font-bold text-white"
                  onClick={saveEdit}
                  type="button"
                >
                  Save
                </button>

                <button
                  className="h-[44px] rounded-[10px] bg-slate-400 px-[14px] font-bold text-white"
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