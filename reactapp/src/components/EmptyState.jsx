import React from "react";

export default function EmptyState({ message = "No data available." }) {
  return (
    <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
      {message}
    </div>
  );
}
