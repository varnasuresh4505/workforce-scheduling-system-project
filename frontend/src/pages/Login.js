import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HeartPulse } from "lucide-react";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("userInfo", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vv-login-wrapper">
      <div className="vv-login-card">
        <div className="vv-login-header">
          <HeartPulse size={36} className="vv-login-icon" />
          <h2 className="vv-login-title">VV Hospital</h2>
          <p className="vv-login-subtitle">Workforce Scheduling System</p>
        </div>

        {error && <div className="vv-login-errorBox">{error}</div>}

        <form className="vv-login-form" onSubmit={handleLogin}>
          <div className="vv-login-field">
            <label className="vv-login-label">Email</label>
            <input
              className={`vv-login-input ${error ? "vv-login-inputError" : ""}`}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="vv-login-field">
            <label className="vv-login-label">Password</label>
            <input
              className={`vv-login-input ${error ? "vv-login-inputError" : ""}`}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="vv-login-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;