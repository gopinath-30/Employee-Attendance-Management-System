import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import apiService from "../services/apiService";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export default function AdminSettings() {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiService
      .getWeekends()
      .then(setSelected)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function toggle(day) {
    setSelected((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const result = await apiService.updateWeekends(selected);
      setSelected(result.weekendDays);
      setSuccess("Weekend configuration updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Organization Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 max-w-lg">
        <h2 className="text-md font-semibold text-gray-800 mb-3">Weekend Configuration</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select the days of the week that are considered non-working days across the organization.
        </p>

        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {DAYS.map((day) => (
              <label key={day} className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2 cursor-pointer">
                <input type="checkbox" checked={selected.includes(day)} onChange={() => toggle(day)} />
                {day.charAt(0) + day.slice(1).toLowerCase()}
              </label>
            ))}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </Layout>
  );
}
