import React from "react";
import Layout from "../components/Layout";
import AttendanceReport from "../components/AttendanceReport";
import { useAuth } from "../context/AuthContext";

export default function EmployeeReportPage() {
  const { user } = useAuth();
  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Monthly Attendance Report</h1>
      <AttendanceReport defaultEmployeeId={user.employeeId} />
    </Layout>
  );
}
