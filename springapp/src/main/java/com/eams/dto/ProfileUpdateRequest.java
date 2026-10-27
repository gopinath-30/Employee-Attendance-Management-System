package com.eams.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String name;
    private String department;
    private String position;
}
