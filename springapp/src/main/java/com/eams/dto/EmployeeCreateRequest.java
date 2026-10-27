
package com.eams.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EmployeeCreateRequest {

    @NotBlank(message = "employeeId is required")
    @Pattern(
        regexp = "EMP\\d{3}",
        message = "employeeId must match pattern EMP followed by exactly 3 digits, e.g. EMP001"
    )
    private String employeeId;

    @NotBlank(message = "name is required")
    private String name;

    @NotBlank(message = "email is required")
    @Email(message = "email must be a valid email address")
    private String email;

    @NotBlank(message = "department is required")
    private String department;

    @NotBlank(message = "position is required")
    private String position;

    @NotNull(message = "joiningDate is required")
    private LocalDate joiningDate;

    @NotBlank(message = "password is required")
    @Size(
        min = 6,
        message = "password must be at least 6 characters"
    )
    private String password;

    private String role;

    private String managerEmployeeId;
}
