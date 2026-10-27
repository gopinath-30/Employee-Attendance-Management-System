// import React, { useEffect, useState } from "react";
// import Layout from "../components/Layout";
// import Alert from "../components/Alert";
// import apiService from "../services/apiService";

// export default function ManagerCorrections() {
//   const [team, setTeam] = useState([]);
//   const [form, setForm] = useState({
//     employeeId: "", date: "", newCheckInTime: "", newCheckOutTime: "", reason: "",
//   });
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     apiService.getMyTeam().then(setTeam).catch(() => {});
//   }, []);

//   function handleChange(e) {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     if (!form.employeeId || !form.date || !form.reason) {
//       setError("Employee, date, and reason are required.");
//       return;
//     }
//     setSubmitting(true);
//     try {
//       const payload = {
//         employeeId: form.employeeId,
//         date: form.date,
//         reason: form.reason,
//         newCheckInTime: form.newCheckInTime ? `${form.date}T${form.newCheckInTime}:00` : undefined,
//         newCheckOutTime: form.newCheckOutTime ? `${form.date}T${form.newCheckOutTime}:00` : undefined,
//       };
//       await apiService.correctAttendance(payload);
//       setSuccess("Attendance record corrected and audit trail recorded.");
//       setForm({ employeeId: "", date: "", newCheckInTime: "", newCheckOutTime: "", reason: "" });
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <Layout>
//       <h1 className="text-xl font-bold text-gray-800 mb-4">Attendance Corrections</h1>

//       <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4 max-w-xl">
//         <Alert type="error">{error}</Alert>
//         <Alert type="success">{success}</Alert>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
//           <select
//             name="employeeId"
//             value={form.employeeId}
//             onChange={handleChange}
//             className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
//           >
//             <option value="">Select a direct report</option>
//             {team.map((t) => (
//               <option key={t.employeeId} value={t.employeeId}>
//                 {t.employeeId} - {t.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//           <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">New Check-in</label>
//             <input type="time" name="newCheckInTime" value={form.newCheckInTime} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">New Check-out</label>
//             <input type="time" name="newCheckOutTime" value={form.newCheckOutTime} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
//           <textarea
//             name="reason"
//             value={form.reason}
//             onChange={handleChange}
//             rows={3}
//             className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
//             placeholder="Explain the reason for this correction..."
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={submitting}
//           className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium"
//         >
//           {submitting ? "Submitting..." : "Submit Correction"}
//         </button>
//       </form>
//     </Layout>
//   );
// }















import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import apiService from "../services/apiService";

export default function ManagerCorrections() {
  const [team, setTeam] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    date: "",
    newCheckInTime: "",
    newCheckOutTime: "",
    reason: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTeam();
  }, []);

  async function loadTeam() {
    try {
      setError("");

      const profile = await apiService.getProfile();
      const teamData = await apiService.getMyTeam();

      /*
       * Manager correction is only for employees.
       *
       * Exclude:
       * 1. The logged-in Manager themselves.
       * 2. Any MANAGER returned accidentally by the backend.
       */
      const managerEmployeeId = profile?.employeeId;

      const employeeTeam = (teamData || []).filter((member) => {
        if (
          managerEmployeeId &&
          member.employeeId === managerEmployeeId
        ) {
          return false;
        }

        if (member.role && member.role !== "EMPLOYEE") {
          return false;
        }

        return true;
      });

      setTeam(employeeTeam);

    } catch (err) {
      setError(
        err.message ||
        "Failed to load your employees."
      );
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
        "Employee, date, and reason are required."
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
        "Attendance record corrected and audit trail recorded."
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

      <p className="text-sm text-gray-500 mb-4">
        Modify attendance records for your direct-report
        employees.
      </p>

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

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4 max-w-xl"
      >

        {/* Employee */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee
          </label>

          <select
            name="employeeId"
            value={form.employeeId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">
              Select an employee
            </option>

            {team.map((employee) => (
              <option
                key={employee.employeeId}
                value={employee.employeeId}
              >
                {employee.employeeId} - {employee.name}
              </option>
            ))}
          </select>

          {team.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              No employees are currently assigned to you.
            </p>
          )}
        </div>

        {/* Date */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Explain the reason for this correction..."
          />
        </div>

        <button
          type="submit"
          disabled={
            submitting ||
            team.length === 0
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
