
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import apiService from "../services/apiService";

export default function AdminCorrections() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    date: "",
    newCheckInTime: "",
    newCheckOutTime: "",
    reason: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data = await apiService.getUsers();

      /*
       * Admin can correct both EMPLOYEE and MANAGER
       * attendance.
       *
       * ADMIN users themselves are not attendance
       * correction targets.
       */
      const correctionTargets = (data || []).filter(
        (user) =>
          user.role === "EMPLOYEE" ||
          user.role === "MANAGER"
      );

      setUsers(correctionTargets);
    } catch (err) {
      setError(
        err.message ||
        "Failed to load employees and managers."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.employeeId ||
      !form.date ||
      !form.reason.trim()
    ) {
      setError(
        "Employee/Manager, date, and reason are required."
      );
      return;
    }

    if (
      !form.newCheckInTime &&
      !form.newCheckOutTime
    ) {
      setError(
        "Enter at least a new check-in or check-out time."
      );
      return;
    }

    if (
      form.newCheckInTime &&
      form.newCheckOutTime &&
      form.newCheckOutTime <= form.newCheckInTime
    ) {
      setError(
        "Checkout time must be after check-in time."
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        employeeId: form.employeeId,
        date: form.date,
        reason: form.reason.trim(),

        newCheckInTime: form.newCheckInTime
          ? `${form.date}T${form.newCheckInTime}:00`
          : undefined,

        newCheckOutTime: form.newCheckOutTime
          ? `${form.date}T${form.newCheckOutTime}:00`
          : undefined,
      };

      await apiService.correctAttendance(payload);

      setSuccess(
        "Attendance corrected successfully. The correction has been recorded in the audit trail."
      );

      setForm({
        employeeId: "",
        date: "",
        newCheckInTime: "",
        newCheckOutTime: "",
        reason: "",
      });

    } catch (err) {
      setError(
        err.message ||
        "Failed to correct attendance."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>

      <h1 className="text-xl font-bold text-gray-800 mb-1">
        Attendance Corrections
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Modify attendance records for employees and managers.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4 max-w-xl"
      >

        <Alert
          type="error"
          onClose={() => setError("")}
        >
          {error}
        </Alert>

        <Alert
          type="success"
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>

        {/* Target User */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee / Manager
          </label>

          <select
            name="employeeId"
            value={form.employeeId}
            onChange={handleChange}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">
              {loading
                ? "Loading users..."
                : "Select employee or manager"}
            </option>

            {users.map((user) => (
              <option
                key={user.employeeId}
                value={user.employeeId}
              >
                {user.employeeId} - {user.name} (
                {user.role})
              </option>
            ))}
          </select>

          {!loading && users.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              No employees or managers found.
            </p>
          )}
        </div>

        {/* Date */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attendance Date
          </label>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Times */}

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Check-in
            </label>

            <input
              type="time"
              name="newCheckInTime"
              value={form.newCheckInTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Check-out
            </label>

            <input
              type="time"
              name="newCheckOutTime"
              value={form.newCheckOutTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

        </div>

        {/* Reason */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason
          </label>

          <textarea
            name="reason"
            value={form.reason}
            onChange={handleChange}
            rows={3}
            placeholder="Explain the reason for this correction..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={
            submitting ||
            loading ||
            users.length === 0
          }
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          {submitting
            ? "Submitting..."
            : "Submit Correction"}
        </button>

      </form>

    </Layout>
  );
}
