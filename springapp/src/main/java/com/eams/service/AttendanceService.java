package com.eams.service;

import com.eams.dto.*;
import com.eams.entity.AttendanceLog;
import com.eams.entity.AttendanceStatus;
import com.eams.entity.User;
import com.eams.exception.BadRequestException;
import com.eams.exception.ConflictException;
import com.eams.exception.ResourceNotFoundException;
import com.eams.repository.AttendanceLogRepository;
import com.eams.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Set;

@Service
public class AttendanceService {

    private final AttendanceLogRepository attendanceLogRepository;
    private final UserRepository userRepository;
    private final AttendanceCalculator calculator;
    private final WorkingDayService workingDayService;
    private final NotificationService notificationService;

    public AttendanceService(AttendanceLogRepository attendanceLogRepository,
                              UserRepository userRepository,
                              AttendanceCalculator calculator,
                              WorkingDayService workingDayService,
                              NotificationService notificationService) {
        this.attendanceLogRepository = attendanceLogRepository;
        this.userRepository = userRepository;
        this.calculator = calculator;
        this.workingDayService = workingDayService;
        this.notificationService = notificationService;
    }

    @Transactional
    public AttendanceResponse checkIn(CheckInRequest request) {
        User user = userRepository.findByEmployeeId(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with employeeId " + request.getEmployeeId()));

        LocalDateTime checkInTime = request.getCheckInTime() != null ? request.getCheckInTime() : LocalDateTime.now();
        LocalDate date = checkInTime.toLocalDate();

        attendanceLogRepository.findByUserIdAndAttendanceDate(user.getId(), date).ifPresent(existing -> {
            throw new ConflictException("Employee has already checked in today");
        });

        AttendanceLog log = AttendanceLog.builder()
                .user(user)
                .attendanceDate(date)
                .checkInTime(checkInTime)
                .status(AttendanceStatus.IN_PROGRESS)
                .corrected(false)
                .build();

        log = attendanceLogRepository.save(log);
        return toResponse(log);
    }

    @Transactional
    public AttendanceResponse checkOut(CheckOutRequest request) {
        User user = userRepository.findByEmployeeId(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with employeeId " + request.getEmployeeId()));

        LocalDateTime checkOutTime = request.getCheckOutTime() != null ? request.getCheckOutTime() : LocalDateTime.now();
        LocalDate date = checkOutTime.toLocalDate();

        AttendanceLog log = attendanceLogRepository.findByUserIdAndAttendanceDate(user.getId(), date)
                .orElseThrow(() -> new BadRequestException("Check-in required before checkout"));

        if (log.getCheckOutTime() != null) {
            throw new ConflictException("Employee has already checked out today");
        }

        if (!checkOutTime.isAfter(log.getCheckInTime())) {
            throw new BadRequestException("Checkout time must be after check-in time");
        }

        double workHours = calculator.calculateWorkHours(log.getCheckInTime(), checkOutTime);
        AttendanceStatus status = calculator.calculateStatus(workHours);

        log.setCheckOutTime(checkOutTime);
        log.setTotalHours(workHours);
        log.setStatus(status);

        log = attendanceLogRepository.save(log);
        return toResponse(log);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getHistory(String employeeId) {
        User user = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with employeeId " + employeeId));
        return attendanceLogRepository.findByUserIdOrderByAttendanceDateDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MonthlyReportResponse getMonthlyReport(String employeeId, int year, int month) {
        User user = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with employeeId " + employeeId));

        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<AttendanceLog> logs = attendanceLogRepository
                .findByUserIdAndAttendanceDateBetweenOrderByAttendanceDateAsc(user.getId(), start, end);

        Set<java.time.DayOfWeek> weekends = workingDayService.getConfiguredWeekends();
        List<LocalDate> workingDays = workingDayService.getWorkingDaysInMonth(year, month);

        java.util.Map<LocalDate, AttendanceLog> logsByDate = new java.util.HashMap<>();
        for (AttendanceLog log : logs) {
            logsByDate.put(log.getAttendanceDate(), log);
        }

        int presentDays = 0;
        int halfDays = 0;
        int absentDays = 0;
        double totalWorkHours = 0.0;
        java.util.List<DailyRecord> dailyRecords = new java.util.ArrayList<>();

        for (LocalDate day : workingDays) {
            AttendanceLog log = logsByDate.get(day);
            if (log == null) {
                absentDays++;
                dailyRecords.add(DailyRecord.builder()
                        .date(day)
                        .checkInTime(null)
                        .checkOutTime(null)
                        .status(AttendanceStatus.ABSENT.getLabel())
                        .workHours(0.0)
                        .corrected(false)
                        .build());
                continue;
            }

            double hours = log.getTotalHours() != null ? log.getTotalHours() : 0.0;
            totalWorkHours += hours;

            if (log.getStatus() == AttendanceStatus.PRESENT) {
                presentDays++;
            } else if (log.getStatus() == AttendanceStatus.HALF_DAY) {
                halfDays++;
            }

            dailyRecords.add(DailyRecord.builder()
                    .date(day)
                    .checkInTime(log.getCheckInTime() != null ? log.getCheckInTime().toLocalTime() : null)
                    .checkOutTime(log.getCheckOutTime() != null ? log.getCheckOutTime().toLocalTime() : null)
                    .status(log.getStatus() != null ? log.getStatus().getLabel() : AttendanceStatus.IN_PROGRESS.getLabel())
                    .workHours(hours)
                    .corrected(log.isCorrected())
                    .build());
        }

        int totalWorkDays = workingDays.size();
        double averageWorkHours = (presentDays + halfDays) > 0
                ? Math.round((totalWorkHours / (presentDays + halfDays)) * 100.0) / 100.0
                : 0.0;

        return MonthlyReportResponse.builder()
                .employeeId(user.getEmployeeId())
                .employeeName(user.getName())
                .year(year)
                .month(month)
                .totalWorkDays(totalWorkDays)
                .presentDays(presentDays)
                .absentDays(absentDays)
                .halfDays(halfDays)
                .totalWorkHours(Math.round(totalWorkHours * 100.0) / 100.0)
                .averageWorkHours(averageWorkHours)
                .dailyRecords(dailyRecords)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getTeamAttendanceForDate(List<Long> userIds, LocalDate date) {
        if (userIds.isEmpty()) {
            return List.of();
        }
        return attendanceLogRepository.findByUserIdInAndAttendanceDate(userIds, date).stream()
                .map(this::toResponse)
                .toList();
    }

    public AttendanceLog getLogEntityForDate(String employeeId, LocalDate date) {
        User user = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with employeeId " + employeeId));
        return attendanceLogRepository.findByUserIdAndAttendanceDate(user.getId(), date)
                .orElseThrow(() -> new ResourceNotFoundException("No attendance record found for " + employeeId + " on " + date));
    }

    public AttendanceResponse toResponse(AttendanceLog log) {
        return AttendanceResponse.builder()
                .id(log.getId())
                .employeeId(log.getUser().getEmployeeId())
                .date(log.getAttendanceDate())
                .checkInTime(log.getCheckInTime())
                .checkOutTime(log.getCheckOutTime())
                .totalHours(log.getTotalHours())
                .status(log.getStatus() != null ? log.getStatus().getLabel() : null)
                .corrected(log.isCorrected())
                .build();
    }
}
