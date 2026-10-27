package com.eams.dto;

import lombok.Data;

import java.util.List;

@Data
public class WeekendConfigRequest {
    // e.g. ["SATURDAY", "SUNDAY"]
    private List<String> weekendDays;
}
