import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Alert from "../components/Alert";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService";

export default function EmployeeAttendanceHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    apiService
      .getAttendanceHistory(user.employeeId)
      .then(setHistory)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user.employeeId]);

  const sorted = [...history].sort((a, b) =>
    sortDesc ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)
  );

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Attendance History</h1>
        <button
          onClick={() => setSortDesc((s) => !s)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50"
        >
          Sort: {sortDesc ? "Newest first" : "Oldest first"}
        </button>
      </div>

      <Alert type="error">{error}</Alert>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        {loading ? (
          <LoadingSpinner />
        ) : sorted.length === 0 ? (
          <EmptyState message="No attendance records found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Check-in</th>
                  <th className="py-2 pr-4">Check-out</th>
                  <th className="py-2 pr-4">Hours</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Corrected</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((h) => (
                  <tr key={h.id} className="border-b border-gray-50">
                    <td className="py-2 pr-4">{h.date}</td>
                    <td className="py-2 pr-4">{h.checkInTime ? h.checkInTime.split("T")[1]?.slice(0, 5) : "-"}</td>
                    <td className="py-2 pr-4">{h.checkOutTime ? h.checkOutTime.split("T")[1]?.slice(0, 5) : "-"}</td>
                    <td className="py-2 pr-4">{h.totalHours ?? "-"}</td>
                    <td className="py-2 pr-4"><StatusBadge status={h.status} /></td>
                    <td className="py-2 pr-4">{h.corrected ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
