package com.eams.controller;

import com.eams.dto.*;
import com.eams.entity.Role;
import com.eams.entity.User;
import com.eams.exception.UnauthorizedException;
import com.eams.security.CurrentUserProvider;
import com.eams.service.AttendanceService;
import com.eams.service.CsvExportService;
import com.eams.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final EmployeeService employeeService;
    private final CurrentUserProvider currentUserProvider;
    private final CsvExportService csvExportService;

    public AttendanceController(AttendanceService attendanceService,
                                 EmployeeService employeeService,
                                 CurrentUserProvider currentUserProvider,
                                 CsvExportService csvExportService) {
        this.attendanceService = attendanceService;
        this.employeeService = employeeService;
        this.currentUserProvider = currentUserProvider;
        this.csvExportService = csvExportService;
    }

    @PostMapping("/check-in")
    public ResponseEntity<AttendanceResponse> checkIn(@Valid @RequestBody CheckInRequest request) {
        assertSelfOrPrivileged(request.getEmployeeId());
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.checkIn(request));
    }

    @PutMapping("/check-out")
    public ResponseEntity<AttendanceResponse> checkOut(@Valid @RequestBody CheckOutRequest request) {
        assertSelfOrPrivileged(request.getEmployeeId());
        return ResponseEntity.ok(attendanceService.checkOut(request));
    }

    @GetMapping("/report")
    public ResponseEntity<MonthlyReportResponse> getMonthlyReport(
            @RequestParam String employeeId,
            @RequestParam int year,
            @RequestParam int month) {
        assertSelfOrPrivileged(employeeId);
        return ResponseEntity.ok(attendanceService.getMonthlyReport(employeeId, year, month));
    }

    @GetMapping("/history")
    public ResponseEntity<List<AttendanceResponse>> getHistory(@RequestParam String employeeId) {
        assertSelfOrPrivileged(employeeId);
        return ResponseEntity.ok(attendanceService.getHistory(employeeId));
    }

    @GetMapping("/team")
    public ResponseEntity<List<AttendanceResponse>> getTeamAttendance(
            @RequestParam(required = false) String date) {
        User current = currentUserProvider.getCurrentUser();
        if (current.getRole() != Role.MANAGER && current.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only managers and admins can view team attendance");
        }
        LocalDate targetDate = (date != null) ? LocalDate.parse(date) : LocalDate.now();

        List<Long> userIds;
        if (current.getRole() == Role.ADMIN) {
            userIds = employeeService.getAllEmployees(null).stream().map(EmployeeResponse::getId).toList();
        } else {
            userIds = employeeService.getAllEmployees(null).stream()
                    .filter(e -> current.getEmployeeId().equals(e.getManagerEmployeeId()))
                    .map(EmployeeResponse::getId)
                    .toList();
        }
        return ResponseEntity.ok(attendanceService.getTeamAttendanceForDate(userIds, targetDate));
    }

    @GetMapping(value = "/report/export", produces = "text/csv")
    public ResponseEntity<String> exportReportCsv(@RequestParam String employeeId) {
        assertSelfOrPrivileged(employeeId);
        List<AttendanceResponse> history = attendanceService.getHistory(employeeId);
        String csv = csvExportService.toCsv(history);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + employeeId + "_attendance.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    private void assertSelfOrPrivileged(String employeeId) {
        User current = currentUserProvider.getCurrentUser();
        if (current.getRole() == Role.ADMIN) {
            return;
        }
        if (current.getEmployeeId().equals(employeeId)) {
            return;
        }
        if (current.getRole() == Role.MANAGER) {
            EmployeeResponse target = employeeService.getEmployeeByEmployeeId(employeeId);
            if (current.getEmployeeId().equals(target.getManagerEmployeeId())) {
                return;
            }
        }
        throw new UnauthorizedException("You may only access your own attendance records, or those of your direct reports");
    }
}
