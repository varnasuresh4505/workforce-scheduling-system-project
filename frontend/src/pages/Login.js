import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HeartPulse } from "lucide-react";
import { API_BASE_URL } from "../services/api";

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
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
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
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4 font-['Poppins',sans-serif]">
      <div className="w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-900 text-white">
            <HeartPulse size={28} />
          </div>

          <h2 className="mt-4 text-[26px] font-bold text-slate-900">
            SVT Hospital
          </h2>
          <p className="mt-1 text-[14px] text-slate-500">
            Workforce Scheduling System
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-[14px] font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 w-full rounded-[14px] border border-slate-300 bg-white px-4 text-[14px] text-slate-900 outline-none transition focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.08)]"
            />
          </div>

          <div>
            <label className="mb-2 block text-[14px] font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 w-full rounded-[14px] border border-slate-300 bg-white px-4 text-[14px] text-slate-900 outline-none transition focus:border-slate-900 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.08)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-[14px] bg-slate-900 text-[15px] font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
