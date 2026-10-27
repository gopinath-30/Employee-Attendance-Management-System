import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <p className="text-5xl font-bold text-gray-300 mb-2">403</p>
        <h1 className="text-lg font-semibold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-sm text-gray-500 mb-6">You do not have permission to view this page.</p>
        <Link to="/" className="text-primary-600 font-medium">Go back home</Link>
      </div>
    </div>
  );
}
