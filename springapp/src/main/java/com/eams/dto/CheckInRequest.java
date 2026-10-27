package com.eams.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CheckInRequest {
    @NotBlank
    private String employeeId;

    // Optional - defaults to current time if not supplied
    private LocalDateTime checkInTime;
}
