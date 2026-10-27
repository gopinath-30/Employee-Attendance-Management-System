// import React from "react";
// import { NavLink } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const LINKS = {
//   EMPLOYEE: [
//     { to: "/employee/dashboard", label: "Dashboard" },
//     { to: "/employee/attendance", label: "Attendance History" },
//     { to: "/employee/report", label: "Monthly Report" },
//     { to: "/profile", label: "Profile" },
//   ],
//   MANAGER: [
//     { to: "/manager/dashboard", label: "Dashboard" },
//     { to: "/manager/team-attendance", label: "Team Attendance" },
//     { to: "/manager/reports", label: "Reports" },
//     { to: "/manager/corrections", label: "Corrections" },
//     { to: "/profile", label: "Profile" },
//   ],
//   ADMIN: [
//     { to: "/admin/dashboard", label: "Dashboard" },
//     { to: "/admin/users", label: "User Management" },
//     { to: "/admin/attendance", label: "Attendance" },
//     { to: "/admin/reports", label: "Reports" },
//     { to: "/admin/holidays", label: "Holidays" },
//     { to: "/admin/settings", label: "Settings" },
//     { to: "/profile", label: "Profile" },
//   ],
// };

// export default function Sidebar() {
//   const { user } = useAuth();
//   const links = LINKS[user?.role] || [];

//   return (
//     <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)] p-4">
//       <nav className="flex flex-col gap-1">
//         {links.map((link) => (
//           <NavLink
//             key={link.to}
//             to={link.to}
//             className={({ isActive }) =>
//               `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                 isActive ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50"
//               }`
//             }
//           >
//             {link.label}
//           </NavLink>
//         ))}
//       </nav>
//     </aside>
//   );
// }














import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = {
  EMPLOYEE: [
    { to: "/employee/dashboard", label: "Dashboard" },
    { to: "/employee/attendance", label: "Attendance History" },
    { to: "/employee/report", label: "Monthly Report" },
    { to: "/profile", label: "Profile" },
  ],

  MANAGER: [
    { to: "/manager/dashboard", label: "Dashboard" },
    { to: "/manager/team-attendance", label: "Team Attendance" },
    { to: "/manager/reports", label: "Reports" },
    { to: "/manager/corrections", label: "Corrections" },
    { to: "/profile", label: "Profile" },
  ],

  ADMIN: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/users", label: "User Management" },
    { to: "/admin/attendance", label: "Attendance" },
    { to: "/admin/corrections", label: "Corrections" },
    { to: "/admin/reports", label: "Reports" },
    { to: "/admin/holidays", label: "Holidays" },
    { to: "/admin/settings", label: "Settings" },
    { to: "/profile", label: "Profile" },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();

  const links = LINKS[user?.role] || [];

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)] p-4">
      <nav className="flex flex-col gap-1">

        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}

      </nav>
    </aside>
  );
}
