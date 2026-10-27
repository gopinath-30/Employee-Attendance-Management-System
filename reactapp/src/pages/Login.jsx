import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

const ROLE_HOME = {
  EMPLOYEE: "/employee/dashboard",
  MANAGER: "/manager/dashboard",
  ADMIN: "/admin/dashboard",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await login(email, password);
      const from = location.state?.from?.pathname;
      navigate(from || ROLE_HOME[data.role] || "/", { replace: true });
    } catch (err) {
      setError(err.status === 401 ? "Invalid credentials" : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold mx-auto mb-3 text-lg">
          <img src="https://img.magnific.com/free-vector/glyph-calendar-with-check-mark_78370-7210.jpg?semt=ais_hybrid&w=740&q=80" width={50} height={50}></img>

          </div>
          <h1 className="text-xl font-bold text-gray-800">Employee Attendance</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
        </div>

        <Alert type="error">{error}</Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account? <Link to="/register" className="text-primary-600 font-medium">Register</Link>
        </p> */}

        {/* <div className="mt-6 text-xs text-gray-400 border-t border-gray-100 pt-4">
          <p className="font-medium text-gray-500 mb-1">Demo credentials</p>
          <p>Admin: admin@eams.com / Admin@123</p>
          <p>Manager: manager@eams.com / Manager@123</p>
          <p>Employee: john.doe@eams.com / Employee@123</p>
        </div> */}
      </div>
    </div>
  );
}
