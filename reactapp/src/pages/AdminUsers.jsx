import React, { useState } from "react";
import EmployeeList from "../components/EmployeeList";
import EmployeeForm from "../components/EmployeeForm";
import Layout from "../components/Layout";

export default function AdminUsers() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-4">User Management</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <EmployeeForm onCreated={() => setRefreshKey((k) => k + 1)} />
        <EmployeeList key={refreshKey} />
      </div>
    </Layout>
  );
}
