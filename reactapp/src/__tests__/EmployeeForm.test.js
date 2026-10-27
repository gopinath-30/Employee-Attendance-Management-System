import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EmployeeForm from "../components/EmployeeForm";

test("shows validation error for invalid employeeId format", async () => {
  render(<EmployeeForm />);
  fireEvent.change(screen.getByPlaceholderText("EMP001"), { target: { value: "EMP1" } });
  fireEvent.click(screen.getByText("Create Employee"));
  expect(await screen.findByText(/Must match pattern/i)).toBeInTheDocument();
});
