package com.eams.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String name;
    private String department;
    private String position;
    private String role;
    private String managerEmployeeId;
    private Boolean active;
}
