import React from "react";
import Layout from "../components/Layout";
import AttendanceReport from "../components/AttendanceReport";

export default function AdminReports() {
  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Organization Reports</h1>
      <AttendanceReport allowEmployeeIdInput />
    </Layout>
  );
}
