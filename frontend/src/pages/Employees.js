import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Employees.css";

function Employees() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }

    if (user.role !== "admin") {
      navigate("/dashboard");
    }

    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/users",
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      setEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employees");
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      fetchEmployees(); // refresh list
    } catch (error) {
      console.error("Error deleting employee");
    }
  };

  return (
    <div className="employees-container">
      <h2>Employee Management</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.role}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => deleteEmployee(emp._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Employees;