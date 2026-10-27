import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import apiService from "../services/apiService";

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([apiService.getUsers(), apiService.getTeamAttendance()])
      .then(([emps, attendance]) => {
        setEmployees(emps);
        setAttendanceToday(attendance);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = employees.length;
  const present = attendanceToday.filter((a) => a.status === "Present").length;
  const halfDay = attendanceToday.filter((a) => a.status === "Half-day").length;
  const checkedIn = attendanceToday.filter((a) => a.checkInTime && !a.checkOutTime).length;
  const absent = Math.max(total - attendanceToday.length, 0);

  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-1">Admin Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Organization-wide attendance overview.</p>

      <Alert type="error">{error}</Alert>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card title="Total Employees" value={total} />
          <Card title="Present Today" value={present} accent="green" />
          <Card title="Checked In (open)" value={checkedIn} />
          <Card title="Half-day" value={halfDay} accent="yellow" />
          <Card title="Absent (est.)" value={absent} accent="red" />
        </div>
      )}
    </Layout>
  );
}
