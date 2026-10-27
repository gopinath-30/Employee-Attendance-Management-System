import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import apiService from "../services/apiService";

export default function AdminAttendance() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiService
      .getTeamAttendance(date)
      .then(setAttendance)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold text-gray-800">Organization Attendance</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        />
      </div>

      <Alert type="error">{error}</Alert>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        {loading ? (
          <LoadingSpinner />
        ) : attendance.length === 0 ? (
          <EmptyState message="No attendance records for this date." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-4">Employee ID</th>
                <th className="py-2 pr-4">Check-in</th>
                <th className="py-2 pr-4">Check-out</th>
                <th className="py-2 pr-4">Hours</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Corrected</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id} className="border-b border-gray-50">
                  <td className="py-2 pr-4 font-medium">{a.employeeId}</td>
                  <td className="py-2 pr-4">{a.checkInTime ? a.checkInTime.split("T")[1]?.slice(0, 5) : "-"}</td>
                  <td className="py-2 pr-4">{a.checkOutTime ? a.checkOutTime.split("T")[1]?.slice(0, 5) : "-"}</td>
                  <td className="py-2 pr-4">{a.totalHours ?? "-"}</td>
                  <td className="py-2 pr-4"><StatusBadge status={a.status} /></td>
                  <td className="py-2 pr-4">{a.corrected ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
