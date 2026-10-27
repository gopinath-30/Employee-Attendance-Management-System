import React from "react";

const STYLES = {
  error: "bg-red-50 text-red-700 border-red-200",
  success: "bg-green-50 text-green-700 border-green-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function Alert({ type = "info", children, onClose }) {
  if (!children) return null;
  return (
    <div className={`flex items-start justify-between gap-2 border rounded-lg px-4 py-3 text-sm mb-4 ${STYLES[type]}`}>
      <span>{children}</span>
      {onClose && (
        <button onClick={onClose} className="font-bold leading-none opacity-60 hover:opacity-100">
          &times;
        </button>
      )}
    </div>
  );
}
