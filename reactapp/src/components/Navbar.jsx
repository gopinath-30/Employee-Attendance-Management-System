import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    apiService
      .getNotifications()
      .then((data) => {
        if (active) setUnread(data.filter((n) => !n.read).length);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">
          <img src="https://img.magnific.com/free-vector/glyph-calendar-with-check-mark_78370-7210.jpg?semt=ais_hybrid&w=740&q=80" width={50} height={50}></img>

          </div>
          <span className="font-semibold text-gray-800 hidden sm:inline">
            Employee Attendance Management
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/notifications")}
            className="relative text-gray-500 hover:text-primary-600"
            title="Notifications"
          >
            {/* 🔔 */}
            <img src="https://cdn.freepixel.com/preview/free-svg-a-simple-solid-bell-icon-commonly-used-to-represen-preview-73-bell-c-os-215668.jpg" width={25} height={20}></img>
            {unread > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
