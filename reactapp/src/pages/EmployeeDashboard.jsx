import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import AttendanceControl from "../components/AttendanceControl";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const now = new Date();
    Promise.all([
      apiService.getAttendanceHistory(user.employeeId),
      apiService.getAttendanceReport(user.employeeId, now.getFullYear(), now.getMonth() + 1),
    ])
      .then(([hist, rep]) => {
        setHistory(hist.slice(0, 5));
        setReport(rep);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user.employeeId]);

  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-1">Welcome back, {user.name.split(" ")[0]} 👋</h1>
      <p className="text-sm text-gray-500 mb-6">Here&apos;s your attendance overview.</p>

      <Alert type="error">{error}</Alert>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-1">
          <AttendanceControl employeeId={user.employeeId} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card title="Present Days" value={report?.presentDays ?? "-"} accent="green" />
          <Card title="Half Days" value={report?.halfDays ?? "-"} accent="yellow" />
          <Card title="Absent Days" value={report?.absentDays ?? "-"} accent="red" />
          <Card title="Total Hours" value={report?.totalWorkHours ?? "-"} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-md font-semibold text-gray-800 mb-3">Recent Attendance</h2>
        {loading ? (
          <LoadingSpinner />
        ) : history.length === 0 ? (
          <EmptyState message="No attendance records yet. Check in to get started!" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Check-in</th>
                <th className="py-2 pr-4">Check-out</th>
                <th className="py-2 pr-4">Hours</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-gray-50">
                  <td className="py-2 pr-4">{h.date}</td>
                  <td className="py-2 pr-4">{h.checkInTime ? h.checkInTime.split("T")[1]?.slice(0, 5) : "-"}</td>
                  <td className="py-2 pr-4">{h.checkOutTime ? h.checkOutTime.split("T")[1]?.slice(0, 5) : "-"}</td>
                  <td className="py-2 pr-4">{h.totalHours ?? "-"}</td>
                  <td className="py-2 pr-4"><StatusBadge status={h.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
