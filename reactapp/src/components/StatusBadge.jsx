import React from "react";

const STYLES = {
  Present: "bg-green-100 text-green-700 border-green-300",
  "Half-day": "bg-yellow-100 text-yellow-700 border-yellow-300",
  Partial: "bg-orange-100 text-orange-700 border-orange-300",
  Absent: "bg-red-100 text-red-700 border-red-300",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-300",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || "bg-gray-100 text-gray-700 border-gray-300";
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${style}`}>
      {status || "Unknown"}
    </span>
  );
}
