
import React, { useEffect, useState } from "react";
import apiService from "../services/apiService";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const data = await apiService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id) {
    try {
      await apiService.markNotificationRead(id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update notification");
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Notifications
        </h1>

        <p className="text-gray-500">
          Loading notifications...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Notifications
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            View your latest attendance and system notifications.
          </p>
        </div>

        <button
          onClick={loadNotifications}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">🔔</div>

          <h2 className="font-semibold text-gray-700">
            No notifications
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            You're all caught up.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white border rounded-xl p-4 ${
                notification.read
                  ? "border-gray-200"
                  : "border-primary-300 bg-primary-50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className={`text-sm ${
                      notification.read
                        ? "text-gray-600"
                        : "font-medium text-gray-800"
                    }`}
                  >
                    {notification.message}
                  </p>

                  {notification.createdAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </p>
                  )}
                </div>

                {!notification.read && (
                  <button
                    onClick={() =>
                      markAsRead(notification.id)
                    }
                    className="shrink-0 text-sm px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
