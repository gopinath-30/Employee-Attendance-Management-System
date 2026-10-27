
import React, { useEffect, useState } from "react";
import apiService from "../services/apiService";
import Alert from "./Alert";
import StatusBadge from "./StatusBadge";

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AttendanceControl({ employeeId }) {
  const [today, setToday] = useState(null);
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!employeeId) {
      setToday(null);
      return;
    }

    loadToday();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  async function loadToday() {
    try {
      setError("");

      const history =
        await apiService.getAttendanceHistory(employeeId);

      const todayStr = getLocalDateString();

      const record = history.find(
        (h) => h.date === todayStr
      );

      setToday(record || null);

    } catch (err) {
      setError(
        err.message || "Unable to load today's attendance."
      );
    }
  }

  async function handleCheckIn() {
    if (!employeeId) {
      setError("Employee ID is not available.");
      return;
    }

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const record =
        await apiService.checkIn(employeeId);

      setToday(record);

      setSuccess("Checked in successfully.");

    } catch (err) {
      setError(
        err.message || "Failed to check in."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckOut() {
    if (!employeeId) {
      setError("Employee ID is not available.");
      return;
    }

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const record =
        await apiService.checkOut(employeeId);

      setToday(record);

      setSuccess("Checked out successfully.");

    } catch (err) {
      setError(
        err.message || "Failed to check out."
      );
    } finally {
      setBusy(false);
    }
  }

  const hasCheckedIn =
    !!today?.checkInTime;

  const hasCheckedOut =
    !!today?.checkOutTime;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">

        <div>
          <p className="text-sm text-gray-400">
            {now.toLocaleDateString()}
          </p>

          <p className="text-2xl font-bold text-gray-800">
            {now.toLocaleTimeString()}
          </p>
        </div>

        {today && (
          <StatusBadge status={today.status} />
        )}
      </div>

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

      <div className="flex gap-3">

        {!hasCheckedIn && (
          <button
            onClick={handleCheckIn}
            disabled={busy || !employeeId}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium"
          >
            {busy ? "Processing..." : "Check In"}
          </button>
        )}

        {hasCheckedIn && !hasCheckedOut && (
          <button
            onClick={handleCheckOut}
            disabled={busy || !employeeId}
            className="flex-1 bg-gray-800 hover:bg-gray-900 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium"
          >
            {busy ? "Processing..." : "Check Out"}
          </button>
        )}

        {hasCheckedIn && hasCheckedOut && (
          <div className="flex-1 text-center py-2.5 rounded-lg bg-green-50 text-green-700 font-medium">
            Completed for today &mdash;{" "}
            {today.totalHours}h worked
          </div>
        )}

      </div>
    </div>
  );
}
