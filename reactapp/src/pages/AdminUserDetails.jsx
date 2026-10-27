import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import EmployeeDetails from "../components/EmployeeDetails";
import Alert from "../components/Alert";
import apiService from "../services/apiService";

export default function AdminUserDetails() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState({ role: "", department: "", position: "", managerEmployeeId: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    apiService.getUsers().then((all) => {
      setManagers(all.filter((u) => u.role === "MANAGER"));
    }).catch(() => {});
  }, []);

  async function handleUpdate(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const payload = {};
      if (form.role) payload.role = form.role;
      if (form.department) payload.department = form.department;
      if (form.position) payload.position = form.position;
      if (form.managerEmployeeId) payload.managerEmployeeId = form.managerEmployeeId;
      await apiService.updateUser(employeeId, payload);
      setSuccess("Employee updated.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeactivate() {
    if (!window.confirm(`Deactivate employee ${employeeId}? They will no longer be able to log in.`)) return;
    try {
      await apiService.deactivateUser(employeeId);
      setSuccess("Employee deactivated.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout>
      <button onClick={() => navigate(-1)} className="text-sm text-primary-600 mb-3">&larr; Back</button>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Employee: {employeeId}</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <EmployeeDetails employeeId={employeeId} />

        <form onSubmit={handleUpdate} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4 h-fit">
          <h2 className="text-md font-semibold text-gray-800">Manage Employee</h2>
          <Alert type="error">{error}</Alert>
          <Alert type="success">{success}</Alert>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">No change</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Manager</label>
            <select
              value={form.managerEmployeeId}
              onChange={(e) => setForm((p) => ({ ...p, managerEmployeeId: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">No change</option>
              {managers.map((m) => (
                <option key={m.employeeId} value={m.employeeId}>{m.employeeId} - {m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              value={form.department}
              onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Leave blank for no change"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              value={form.position}
              onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Leave blank for no change"
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleDeactivate}
              className="border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Deactivate
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
