import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import apiService from "../services/apiService";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { updateStoredProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", department: "", position: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    apiService
      .getProfile()
      .then((data) => {
        setProfile(data);
        setForm({ name: data.name, department: data.department || "", position: data.position || "" });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const updated = await apiService.updateProfile(form);
      setProfile(updated);
      updateStoredProfile({ name: updated.name });
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (pwForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }
    setPwSaving(true);
    try {
      await apiService.changePassword(pwForm);
      setPwSuccess("Password changed successfully.");
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-4">My Profile</h1>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h2 className="text-md font-semibold text-gray-800">Profile Information</h2>
            <Alert type="error">{error}</Alert>
            <Alert type="success">{success}</Alert>

            <ReadOnlyField label="Employee ID" value={profile?.employeeId} />
            <ReadOnlyField label="Email" value={profile?.email} />
            <ReadOnlyField label="Role" value={profile?.role} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input
                value={form.position}
                onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>

          <form onSubmit={handlePasswordChange} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h2 className="text-md font-semibold text-gray-800">Change Password</h2>
            <Alert type="error">{pwError}</Alert>
            <Alert type="success">{pwSuccess}</Alert>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={pwSaving}
              className="bg-gray-800 hover:bg-gray-900 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {pwSaving ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      )}
    </Layout>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <div className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600">{value}</div>
    </div>
  );
}
