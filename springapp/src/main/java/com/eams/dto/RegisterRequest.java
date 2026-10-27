package com.eams.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, message = "password must be at least 6 characters")
    private String password;

    @NotBlank
    @Pattern(regexp = "EMP\\d{3}")
    private String employeeId;

    private String department;
    private String position;
}
