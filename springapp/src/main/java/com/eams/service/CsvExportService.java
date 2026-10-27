package com.eams.service;

import com.eams.dto.AttendanceResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CsvExportService {

    public String toCsv(List<AttendanceResponse> records) {
        StringBuilder sb = new StringBuilder();
        sb.append("Employee ID,Date,Check-In,Check-Out,Total Hours,Status,Corrected\n");
        for (AttendanceResponse r : records) {
            sb.append(csv(r.getEmployeeId())).append(',')
              .append(csv(String.valueOf(r.getDate()))).append(',')
              .append(csv(r.getCheckInTime() != null ? r.getCheckInTime().toString() : "")).append(',')
              .append(csv(r.getCheckOutTime() != null ? r.getCheckOutTime().toString() : "")).append(',')
              .append(csv(r.getTotalHours() != null ? r.getTotalHours().toString() : "0")).append(',')
              .append(csv(r.getStatus() != null ? r.getStatus() : "")).append(',')
              .append(r.isCorrected())
              .append('\n');
        }
        return sb.toString();
    }

    private String csv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
