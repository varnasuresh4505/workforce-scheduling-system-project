import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  if (!userInfo) return <p>Loading...</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Dashboard</h2>
      <h3>Welcome {userInfo.name}</h3>
      <p>Email: {userInfo.email}</p>
      <p>Role: {userInfo.role}</p>
      <button onClick={logoutHandler}>Logout</button>
    </div>
  );
}

export default Dashboard;