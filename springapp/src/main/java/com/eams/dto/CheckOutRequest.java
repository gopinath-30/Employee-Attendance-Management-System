package com.eams.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CheckOutRequest {
    @NotBlank
    private String employeeId;

    private LocalDateTime checkOutTime;
}
