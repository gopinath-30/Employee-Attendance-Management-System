import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import apiService from "../services/apiService";

export default function ManagerTeamAttendance() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [team, setTeam] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [teamData, attendanceData] = await Promise.all([
        apiService.getMyTeam(),
        apiService.getTeamAttendance(date),
      ]);
      setTeam(teamData);
      setAttendance(attendanceData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const attendanceByEmployee = Object.fromEntries(attendance.map((a) => [a.employeeId, a]));

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold text-gray-800">Team Attendance</h1>
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
        ) : team.length === 0 ? (
          <EmptyState message="No team members assigned to you yet." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-4">Employee ID</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Check-in</th>
                <th className="py-2 pr-4">Check-out</th>
                <th className="py-2 pr-4">Hours</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {team.map((emp) => {
                const record = attendanceByEmployee[emp.employeeId];
                return (
                  <tr key={emp.employeeId} className="border-b border-gray-50">
                    <td className="py-2 pr-4 font-medium">{emp.employeeId}</td>
                    <td className="py-2 pr-4">{emp.name}</td>
                    <td className="py-2 pr-4">{record?.checkInTime ? record.checkInTime.split("T")[1]?.slice(0, 5) : "-"}</td>
                    <td className="py-2 pr-4">{record?.checkOutTime ? record.checkOutTime.split("T")[1]?.slice(0, 5) : "-"}</td>
                    <td className="py-2 pr-4">{record?.totalHours ?? "-"}</td>
                    <td className="py-2 pr-4">{record ? <StatusBadge status={record.status} /> : <StatusBadge status="Absent" />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
