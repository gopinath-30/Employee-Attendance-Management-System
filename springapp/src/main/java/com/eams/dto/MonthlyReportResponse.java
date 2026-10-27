package com.eams.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyReportResponse {
    private String employeeId;
    private String employeeName;
    private int year;
    private int month;
    private int totalWorkDays;
    private int presentDays;
    private int absentDays;
    private int halfDays;
    private double totalWorkHours;
    private double averageWorkHours;
    private List<DailyRecord> dailyRecords;
}
