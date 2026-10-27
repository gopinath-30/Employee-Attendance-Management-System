import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import LoadingSpinner from "./LoadingSpinner";
import Alert from "./Alert";
import EmptyState from "./EmptyState";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    load(department);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department]);

  async function load(dept) {
    setLoading(true);
    setError("");
    try {
      const data = await apiService.getEmployees(dept || undefined);
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department).filter(Boolean))),
    [employees]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Employees</h2>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <Alert type="error">{error}</Alert>

      {loading ? (
        <LoadingSpinner />
      ) : employees.length === 0 ? (
        <EmptyState message="No employees found." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-4">Employee ID</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Department</th>
                <th className="py-2 pr-4">Position</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.employeeId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 pr-4 font-medium text-gray-700">{emp.employeeId}</td>
                  <td className="py-2 pr-4">{emp.name}</td>
                  <td className="py-2 pr-4">{emp.department}</td>
                  <td className="py-2 pr-4">{emp.position}</td>
                  <td className="py-2 pr-4 text-right">
                    <button
                      onClick={() => navigate(`/admin/users/${emp.employeeId}`)}
                      className="text-primary-600 hover:underline text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
