import { useEffect, useState } from "react";
import axios from "axios";
import "./Employees.css";

function Employees() {
  const [employees, setEmployees] = useState([]);

  const user = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await axios.get("http://localhost:5000/api/employees", {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });

    setEmployees(res.data);
  };

  const deleteEmployee = async (id) => {
    await axios.delete(`http://localhost:5000/api/employees/${id}`, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });

    fetchEmployees();
  };

  return (
    <div className="employees-container">
      <h2>Employee Management</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>
                <button onClick={() => deleteEmployee(emp._id)}>
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