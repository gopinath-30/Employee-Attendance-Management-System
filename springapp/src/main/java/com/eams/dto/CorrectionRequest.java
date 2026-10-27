package com.eams.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CorrectionRequest {
    @NotBlank
    private String employeeId;

    @NotNull
    private LocalDate date;

    private LocalDateTime newCheckInTime;
    private LocalDateTime newCheckOutTime;

    @NotBlank
    private String reason;
}
