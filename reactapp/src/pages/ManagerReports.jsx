import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import AttendanceReport from "../components/AttendanceReport";
import apiService from "../services/apiService";

export default function ManagerReports() {
  const [team, setTeam] = useState([]);

  useEffect(() => {
    apiService.getMyTeam().then(setTeam).catch(() => {});
  }, []);

  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Team Reports</h1>
      {team.length > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          Direct reports: {team.map((t) => t.employeeId).join(", ")}
        </p>
      )}
      <AttendanceReport allowEmployeeIdInput />
    </Layout>
  );
}
