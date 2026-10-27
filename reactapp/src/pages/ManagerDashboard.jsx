// import React, { useEffect, useState } from "react";
// import Layout from "../components/Layout";
// import Card from "../components/Card";
// import LoadingSpinner from "../components/LoadingSpinner";
// import Alert from "../components/Alert";
// import EmptyState from "../components/EmptyState";
// import StatusBadge from "../components/StatusBadge";
// import apiService from "../services/apiService";

// export default function ManagerDashboard() {
//   const [team, setTeam] = useState([]);
//   const [todayAttendance, setTodayAttendance] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     Promise.all([apiService.getMyTeam(), apiService.getTeamAttendance()])
//       .then(([teamData, attendanceData]) => {
//         setTeam(teamData);
//         setTodayAttendance(attendanceData);
//       })
//       .catch((err) => setError(err.message))
//       .finally(() => setLoading(false));
//   }, []);

//   const present = todayAttendance.filter((a) => a.status === "Present").length;
//   const halfDay = todayAttendance.filter((a) => a.status === "Half-day").length;
//   const checkedIn = todayAttendance.filter((a) => a.checkInTime && !a.checkOutTime).length;
//   const issues = todayAttendance.filter((a) => a.status === "Partial").length;

//   return (
//     <Layout>
//       <h1 className="text-xl font-bold text-gray-800 mb-1">Manager Dashboard</h1>
//       <p className="text-sm text-gray-500 mb-6">Overview of your team&apos;s attendance today.</p>

//       <Alert type="error">{error}</Alert>

//       {loading ? (
//         <LoadingSpinner />
//       ) : (
//         <>
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
//             <Card title="Team Size" value={team.length} />
//             <Card title="Present Today" value={present} accent="green" />
//             <Card title="Checked In (open)" value={checkedIn} />
//             <Card title="Half-day" value={halfDay} accent="yellow" />
//             <Card title="Attendance Issues" value={issues} accent="red" />
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//             <h2 className="text-md font-semibold text-gray-800 mb-3">Recent Team Activity (Today)</h2>
//             {todayAttendance.length === 0 ? (
//               <EmptyState message="No attendance activity recorded yet today." />
//             ) : (
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="text-left text-gray-500 border-b border-gray-100">
//                     <th className="py-2 pr-4">Employee ID</th>
//                     <th className="py-2 pr-4">Check-in</th>
//                     <th className="py-2 pr-4">Check-out</th>
//                     <th className="py-2 pr-4">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {todayAttendance.map((a) => (
//                     <tr key={a.id} className="border-b border-gray-50">
//                       <td className="py-2 pr-4 font-medium">{a.employeeId}</td>
//                       <td className="py-2 pr-4">{a.checkInTime ? a.checkInTime.split("T")[1]?.slice(0, 5) : "-"}</td>
//                       <td className="py-2 pr-4">{a.checkOutTime ? a.checkOutTime.split("T")[1]?.slice(0, 5) : "-"}</td>
//                       <td className="py-2 pr-4"><StatusBadge status={a.status} /></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </>
//       )}
//     </Layout>
//   );
// }











import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import AttendanceControl from "../components/AttendanceControl";
import apiService from "../services/apiService";

export default function ManagerDashboard() {
  const [profile, setProfile] = useState(null);
  const [team, setTeam] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      /*
       * Get the currently logged-in Manager from the backend.
       * This gives us the real employeeId instead of relying
       * on a localStorage "user" object.
       */
      const [profileData, teamData, attendanceData] =
        await Promise.all([
          apiService.getProfile(),
          apiService.getMyTeam(),
          apiService.getTeamAttendance(),
        ]);

      setProfile(profileData);
      setTeam(teamData || []);
      setTodayAttendance(attendanceData || []);

    } catch (err) {
      setError(
        err.message ||
        "Failed to load manager dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  const present = todayAttendance.filter(
    (a) => a.status === "Present"
  ).length;

  const halfDay = todayAttendance.filter(
    (a) => a.status === "Half-day"
  ).length;

  const checkedIn = todayAttendance.filter(
    (a) =>
      a.checkInTime &&
      !a.checkOutTime
  ).length;

  const issues = todayAttendance.filter(
    (a) => a.status === "Partial"
  ).length;

  /*
   * Profile response should contain the logged-in
   * user's employeeId.
   */
  const managerEmployeeId =
    profile?.employeeId || "";

  return (
    <Layout>

      <h1 className="text-xl font-bold text-gray-800 mb-1">
        Manager Dashboard
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Manage your attendance and monitor your team's
        attendance today.
      </p>

      <Alert type="error">
        {error}
      </Alert>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>

          {/* =============================== */}
          {/* MY ATTENDANCE                    */}
          {/* =============================== */}

          <div className="mb-6">

            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              My Attendance
            </h2>

            {managerEmployeeId ? (
              <AttendanceControl
                employeeId={managerEmployeeId}
              />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4">
                Unable to determine your employee ID.
                Please log out and log in again.
              </div>
            )}

          </div>

          {/* =============================== */}
          {/* TEAM SUMMARY                     */}
          {/* =============================== */}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">

            <Card
              title="Team Size"
              value={team.length}
            />

            <Card
              title="Present Today"
              value={present}
              accent="green"
            />

            <Card
              title="Checked In (open)"
              value={checkedIn}
            />

            <Card
              title="Half-day"
              value={halfDay}
              accent="yellow"
            />

            <Card
              title="Attendance Issues"
              value={issues}
              accent="red"
            />

          </div>

          {/* =============================== */}
          {/* TEAM ATTENDANCE                  */}
          {/* =============================== */}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">

            <div className="flex items-center justify-between mb-3">

              <div>
                <h2 className="text-md font-semibold text-gray-800">
                  Recent Team Activity (Today)
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  You can modify attendance for your
                  employees according to your business rules.
                </p>
              </div>

              <button
                type="button"
                onClick={loadDashboard}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Refresh
              </button>

            </div>

            {todayAttendance.length === 0 ? (
              <EmptyState
                message="No attendance activity recorded yet today."
              />
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">

                      <th className="py-2 pr-4">
                        Employee ID
                      </th>

                      <th className="py-2 pr-4">
                        Check-in
                      </th>

                      <th className="py-2 pr-4">
                        Check-out
                      </th>

                      <th className="py-2 pr-4">
                        Status
                      </th>

                      <th className="py-2 pr-4">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {todayAttendance.map((a) => (

                      <tr
                        key={a.id}
                        className="border-b border-gray-50"
                      >

                        <td className="py-2 pr-4 font-medium">
                          {a.employeeId}
                        </td>

                        <td className="py-2 pr-4">
                          {a.checkInTime
                            ? a.checkInTime
                                .split("T")[1]
                                ?.slice(0, 5)
                            : "-"}
                        </td>

                        <td className="py-2 pr-4">
                          {a.checkOutTime
                            ? a.checkOutTime
                                .split("T")[1]
                                ?.slice(0, 5)
                            : "-"}
                        </td>

                        <td className="py-2 pr-4">
                          <StatusBadge
                            status={a.status}
                          />
                        </td>

                        <td className="py-2 pr-4">

                          <button
                            type="button"
                            className="text-primary-600 hover:text-primary-800 font-medium"
                            onClick={() => {
                              window.location.href =
                                `/attendance/correct/${a.employeeId}/${a.date}`;
                            }}
                          >
                            Modify
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </>
      )}

    </Layout>
  );
}
