import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Notifications from "./pages/Notifications";
import AdminCorrections from "./pages/AdminCorrections";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeAttendanceHistory from "./pages/EmployeeAttendanceHistory";
import EmployeeReportPage from "./pages/EmployeeReportPage";

import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerTeamAttendance from "./pages/ManagerTeamAttendance";
import ManagerReports from "./pages/ManagerReports";
import ManagerCorrections from "./pages/ManagerCorrections";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetails from "./pages/AdminUserDetails";
import AdminAttendance from "./pages/AdminAttendance";
import AdminReports from "./pages/AdminReports";
import AdminHolidays from "./pages/AdminHolidays";
import AdminSettings from "./pages/AdminSettings";

import "./App.css";

const ROLE_HOME = {
  EMPLOYEE: "/employee/dashboard",
  MANAGER: "/manager/dashboard",
  ADMIN: "/admin/dashboard",
};

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] || "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={["EMPLOYEE", "MANAGER", "ADMIN"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
  path="/notifications"
  element={
    <ProtectedRoute roles={["EMPLOYEE", "MANAGER", "ADMIN"]}>
      <Notifications />
    </ProtectedRoute>
  }
/>

          {/* Employee routes */}
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute roles={["EMPLOYEE"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
  path="/admin/corrections"
  element={
    <ProtectedRoute roles={["ADMIN"]}>
      <AdminCorrections />
    </ProtectedRoute>
  }
/>
          <Route
            path="/employee/attendance"
            element={
              <ProtectedRoute roles={["EMPLOYEE"]}>
                <EmployeeAttendanceHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/report"
            element={
              <ProtectedRoute roles={["EMPLOYEE"]}>
                <EmployeeReportPage />
              </ProtectedRoute>
            }
          />

          {/* Manager routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute roles={["MANAGER"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/team-attendance"
            element={
              <ProtectedRoute roles={["MANAGER"]}>
                <ManagerTeamAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/reports"
            element={
              <ProtectedRoute roles={["MANAGER"]}>
                <ManagerReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/corrections"
            element={
              <ProtectedRoute roles={["MANAGER"]}>
                <ManagerCorrections />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:employeeId"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminUserDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/holidays"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminHolidays />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
