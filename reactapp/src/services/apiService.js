const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function getToken() {
  return localStorage.getItem("eams_token");
}

async function request(path, { method = "GET", body, params, isCsv = false } = {}) {
  let url = `${API_URL}${path}`;
  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    if (query) url += `?${query}`;
  }

  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (isCsv) {
    if (!response.ok) throw await buildError(response);
    return response.text();
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data && data.message ? data.message : `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

async function buildError(response) {
  const text = await response.text();
  const error = new Error(text || `Request failed with status ${response.status}`);
  error.status = response.status;
  return error;
}

const apiService = {
  // ---------- Auth ----------
  login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password } }),
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload }),

  // ---------- Employees ----------
  getEmployees: (department) => request("/api/employees", { params: { department } }),
  getEmployee: (employeeId) => request(`/api/employees/${employeeId}`),
  createEmployee: (payload) => request("/api/employees", { method: "POST", body: payload }),

  // ---------- Attendance ----------
  checkIn: (employeeId, checkInTime) =>
    request("/api/attendance/check-in", { method: "POST", body: { employeeId, checkInTime } }),
  checkOut: (employeeId, checkOutTime) =>
    request("/api/attendance/check-out", { method: "PUT", body: { employeeId, checkOutTime } }),
  getAttendanceHistory: (employeeId) => request("/api/attendance/history", { params: { employeeId } }),
  getAttendanceReport: (employeeId, year, month) =>
    request("/api/attendance/report", { params: { employeeId, year, month } }),
  getTeamAttendance: (date) => request("/api/attendance/team", { params: { date } }),
  exportAttendanceCsv: (employeeId) =>
    request("/api/attendance/report/export", { params: { employeeId }, isCsv: true }),

  // ---------- Corrections ----------
  correctAttendance: (payload) => request("/api/corrections", { method: "POST", body: payload }),

  // ---------- Users (admin) ----------
  getUsers: () => request("/api/users"),
  getMyTeam: () => request("/api/users/team"),
  updateUser: (employeeId, payload) => request(`/api/users/${employeeId}`, { method: "PUT", body: payload }),
  deactivateUser: (employeeId) => request(`/api/users/${employeeId}/deactivate`, { method: "PUT" }),

  // ---------- Holidays ----------
  getHolidays: () => request("/api/holidays"),
  createHoliday: (payload) => request("/api/holidays", { method: "POST", body: payload }),
  updateHoliday: (id, payload) => request(`/api/holidays/${id}`, { method: "PUT", body: payload }),
  deleteHoliday: (id) => request(`/api/holidays/${id}`, { method: "DELETE" }),

  // ---------- Settings (weekends) ----------
  getWeekends: () => request("/api/settings/weekends"),
  updateWeekends: (weekendDays) =>
    request("/api/settings/weekends", { method: "PUT", body: { weekendDays } }),

  // ---------- Profile ----------
  getProfile: () => request("/api/profile"),
  updateProfile: (payload) => request("/api/profile", { method: "PUT", body: payload }),
  changePassword: (payload) => request("/api/profile/password", { method: "PUT", body: payload }),

  // ---------- Notifications ----------
  getNotifications: () => request("/api/notifications"),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: "PUT" }),
};

export default apiService;
