package com.eams.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    private Long id;
    private String employeeId;
    private String name;
    private String email;
    private String department;
    private String position;
    private LocalDate joiningDate;
    private String role;
    private String managerEmployeeId;
    private boolean active;
}
