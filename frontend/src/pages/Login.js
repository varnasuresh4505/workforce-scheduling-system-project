import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HeartPulse } from "lucide-react";

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
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-slate-50 font-['Poppins',sans-serif]">
      <div className="absolute -right-[120px] -top-[120px] h-[380px] w-[380px] rounded-full bg-[#cbcecc]" />
      <div className="absolute -bottom-[140px] -left-[140px] h-[320px] w-[320px] rounded-full bg-[#a8a9a9]" />

      <div className="relative z-[1] w-[400px] max-w-[92vw] rounded-[18px] bg-white/95 p-10 shadow-[0px_100px_100px_rgba(23,24,25,0.15)] backdrop-blur-[10px]">
        <div className="mb-7 text-center">
          <HeartPulse size={40} className="mx-auto text-gray-400" />
          <h2 className="mt-3 mb-[6px] text-[22px] font-semibold text-slate-900">
            SVT Hospital
          </h2>
          <p className="m-0 text-[15px] text-slate-500">
            Workforce Scheduling System
          </p>
        </div>

        {error && (
          <div className="mb-[18px] rounded-[10px] border border-red-200 bg-red-100 p-3 text-center text-[13px] text-red-700">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-[18px]" onSubmit={handleLogin}>
          <div className="flex flex-col">
            <label className="mb-[6px] text-[14px] font-medium text-slate-600">
              Email
            </label>
            <input
              className={`h-12 w-full rounded-[10px] border px-[14px] text-[15px] transition-all duration-200 outline-none ${
                error
                  ? "border-red-600 bg-red-50"
                  : "border-slate-300 bg-whiteshadow-[0px_6px_18px_rgba(15,23,42,0.06)] focus-within:border-slate-900 focus-within:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]"
              }`}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-[6px] text-[14px] font-medium text-slate-600">
              Password
            </label>
            <input
              className={`h-12 w-full rounded-[10px] border px-[14px] text-[15px] transition-all duration-200 outline-none ${
                error
                  ? "border-red-600 bg-red-50"
                  : "border-slate-300 bg-white shadow-[0px_6px_18px_rgba(15,23,42,0.06)] focus-within:border-slate-900 focus-within:shadow-[0_0_0_3px_rgba(15,23,42,0.12)]"
              }`}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="h-12 w-full rounded-[10px] bg-slate-900 text-[15px] font-medium text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:transform-none"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;