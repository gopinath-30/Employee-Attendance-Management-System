import React, { useEffect, useState } from "react";
import apiService from "../services/apiService";
import LoadingSpinner from "./LoadingSpinner";
import Alert from "./Alert";
import EmptyState from "./EmptyState";
import StatusBadge from "./StatusBadge";

export default function EmployeeDetails({ employeeId }) {
  const [employee, setEmployee] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    setError("");
    Promise.all([apiService.getEmployee(employeeId), apiService.getAttendanceHistory(employeeId)])
      .then(([emp, hist]) => {
        setEmployee(emp);
        setHistory(hist.slice(0, 10));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [employeeId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error">{error}</Alert>;
  if (!employee) return <EmptyState message="Employee not found." />;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Employee Details</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Detail label="Employee ID" value={employee.employeeId} />
          <Detail label="Name" value={employee.name} />
          <Detail label="Email" value={employee.email} />
          <Detail label="Department" value={employee.department} />
          <Detail label="Position" value={employee.position} />
          <Detail label="Joining Date" value={employee.joiningDate} />
          <Detail label="Role" value={employee.role} />
          <Detail label="Status" value={employee.active ? "Active" : "Deactivated"} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-md font-semibold text-gray-800 mb-3">Recent Attendance</h3>
        {history.length === 0 ? (
          <EmptyState message="No attendance history yet." />
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
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-gray-800 font-medium">{value ?? "-"}</p>
    </div>
  );
}
