import React, { useState } from "react";
import apiService from "../services/apiService";
import Alert from "./Alert";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import StatusBadge from "./StatusBadge";
import Card from "./Card";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function AttendanceReport({ defaultEmployeeId, allowEmployeeIdInput = false }) {
  const now = new Date();
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId || "");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiService.getAttendanceReport(employeeId, year, month);
      setReport(data);
    } catch (err) {
      setError(err.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    try {
      const csv = await apiService.exportAttendanceCsv(employeeId);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${employeeId}_attendance.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-wrap items-end gap-3">
        {allowEmployeeIdInput && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Employee ID</label>
            <input
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="EMP001"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32"
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {MONTHS.map((m, idx) => (
              <option key={m} value={idx + 1}>{m}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={!employeeId || loading}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Generate Report
        </button>
        {report && (
          <button
            type="button"
            onClick={handleExport}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Export CSV
          </button>
        )}
      </form>

      <Alert type="error">{error}</Alert>

      {loading && <LoadingSpinner label="Generating report..." />}

      {!loading && report && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card title="Work Days" value={report.totalWorkDays} />
            <Card title="Present" value={report.presentDays} accent="green" />
            <Card title="Half Days" value={report.halfDays} accent="yellow" />
            <Card title="Absent" value={report.absentDays} accent="red" />
            <Card title="Total Hours" value={report.totalWorkHours} />
            <Card title="Avg Hours/Day" value={report.averageWorkHours} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Daily Records</h3>
            {report.dailyRecords.length === 0 ? (
              <EmptyState message="No records for this period." />
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
                    {report.dailyRecords.map((d) => (
                      <tr key={d.date} className="border-b border-gray-50">
                        <td className="py-2 pr-4">{d.date}</td>
                        <td className="py-2 pr-4">{d.checkInTime ?? "-"}</td>
                        <td className="py-2 pr-4">{d.checkOutTime ?? "-"}</td>
                        <td className="py-2 pr-4">{d.workHours ?? 0}</td>
                        <td className="py-2 pr-4"><StatusBadge status={d.status} /></td>
                        <td className="py-2 pr-4">{d.corrected ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
