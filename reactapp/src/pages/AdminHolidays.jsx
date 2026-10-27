import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import apiService from "../services/apiService";

export default function AdminHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ date: "", name: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    apiService
      .getHolidays()
      .then((data) => setHolidays(data.sort((a, b) => a.date.localeCompare(b.date))))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.date || !form.name) {
      setError("Both date and name are required.");
      return;
    }
    try {
      if (editingId) {
        await apiService.updateHoliday(editingId, form);
        setSuccess("Holiday updated.");
      } else {
        await apiService.createHoliday(form);
        setSuccess("Holiday added.");
      }
      setForm({ date: "", name: "" });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(h) {
    setForm({ date: h.date, name: h.name });
    setEditingId(h.id);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this holiday?")) return;
    try {
      await apiService.deleteHoliday(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Holiday Management</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4 h-fit">
          <h2 className="text-md font-semibold text-gray-800">{editingId ? "Edit Holiday" : "Add Holiday"}</h2>
          <Alert type="error">{error}</Alert>
          <Alert type="success">{success}</Alert>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {editingId ? "Update" : "Add Holiday"}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ date: "", name: "" }); }} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-md font-semibold text-gray-800 mb-3">Holidays</h2>
          {loading ? (
            <LoadingSpinner />
          ) : holidays.length === 0 ? (
            <EmptyState message="No holidays configured." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h) => (
                  <tr key={h.id} className="border-b border-gray-50">
                    <td className="py-2 pr-4">{h.date}</td>
                    <td className="py-2 pr-4">{h.name}</td>
                    <td className="py-2 pr-4 text-right space-x-2">
                      <button onClick={() => startEdit(h)} className="text-primary-600 text-xs hover:underline">Edit</button>
                      <button onClick={() => handleDelete(h.id)} className="text-red-600 text-xs hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
