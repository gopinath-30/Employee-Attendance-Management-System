
import React, { useState } from "react";

import apiService from "../services/apiService";

import Alert from "./Alert";

const EMPLOYEE_ID_PATTERN = /^EMP\d{3}$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialState = {
  employeeId: "",
  name: "",
  email: "",
  department: "",
  position: "",
  joiningDate: "",
  role: "EMPLOYEE",
  managerEmployeeId: "",
  password: "",
};

export default function EmployeeForm({ onCreated }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next = {};

    if (!EMPLOYEE_ID_PATTERN.test(form.employeeId)) {
      next.employeeId =
        "Must match pattern EMP followed by exactly 3 digits, e.g. EMP001";
    }

    if (!form.name.trim()) {
      next.name = "Name is required";
    }

    if (!EMAIL_PATTERN.test(form.email)) {
      next.email = "Enter a valid email address";
    }

    if (!form.department.trim()) {
      next.department = "Department is required";
    }

    if (!form.position.trim()) {
      next.position = "Position is required";
    }

    if (!form.joiningDate) {
      next.joiningDate = "Joining date is required";
    }

    // Password is mandatory when creating an employee
    if (!form.password) {
      next.password = "Password is required";
    } else if (form.password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
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

    setSubmitError("");
    setSuccess("");

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = { ...form };

      // Manager is optional
      if (!payload.managerEmployeeId) {
        delete payload.managerEmployeeId;
      }

      // Do NOT delete password.
      // Password is required for every new employee.

      const created = await apiService.createEmployee(payload);

      setSuccess(
        `Employee ${created.employeeId} created successfully.`
      );

      setForm(initialState);
      setErrors({});

      if (onCreated) {
        onCreated(created);
      }
    } catch (err) {
      setSubmitError(
        err.message || "Failed to create employee."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4"
    >
      <h2 className="text-lg font-semibold text-gray-800">
        Add Employee
      </h2>

      <Alert type="error">{submitError}</Alert>

      <Alert type="success">{success}</Alert>

      <div className="grid sm:grid-cols-2 gap-4">

        <Field
          label="Employee ID"
          name="employeeId"
          value={form.employeeId}
          onChange={handleChange}
          error={errors.employeeId}
          placeholder="EMP001"
        />

        <Field
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Drake"
        />

        <Field
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="drake@gmail.com"
        />

        <Field
          label="Department"
          name="department"
          value={form.department}
          onChange={handleChange}
          error={errors.department}
          placeholder="IT"
        />

        <Field
          label="Position"
          name="position"
          value={form.position}
          onChange={handleChange}
          error={errors.position}
          placeholder="Software Developer"
        />

        <Field
          label="Joining Date"
          name="joiningDate"
          type="date"
          value={form.joiningDate}
          onChange={handleChange}
          error={errors.joiningDate}
        />

        {/* PASSWORD FIELD */}
        <Field
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Minimum 6 characters"
        />

        {/* ROLE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="EMPLOYEE">
              Employee
            </option>

            <option value="MANAGER">
              Manager
            </option>

            <option value="ADMIN">
              Admin
            </option>
          </select>
        </div>

        <Field
          label="Manager Employee ID (optional)"
          name="managerEmployeeId"
          value={form.managerEmployeeId}
          onChange={handleChange}
          error={errors.managerEmployeeId}
          placeholder="EMP100"
        />

      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        {submitting
          ? "Creating..."
          : "Create Employee"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2 text-sm ${
          error
            ? "border-red-400"
            : "border-gray-300"
        }`}
      />

      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
