package com.eams.service;

import com.eams.entity.AttendanceLog;
import com.eams.entity.User;
import com.eams.repository.AttendanceLogRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Periodically scans for employees who checked in but have not checked out
 * for an unusually long period, and notifies the employee and their manager.
 */
@Component
public class AttendanceMonitorScheduler {

    private static final long LONG_CHECKIN_THRESHOLD_HOURS = 12;

    private final AttendanceLogRepository attendanceLogRepository;
    private final NotificationService notificationService;

    public AttendanceMonitorScheduler(AttendanceLogRepository attendanceLogRepository,
                                       NotificationService notificationService) {
        this.attendanceLogRepository = attendanceLogRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(fixedRate = 30 * 60 * 1000) // every 30 minutes
    public void checkForLongOpenSessions() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        java.util.List<AttendanceLog> logs = new java.util.ArrayList<>();
        logs.addAll(attendanceLogRepository.findByAttendanceDate(today));
        logs.addAll(attendanceLogRepository.findByAttendanceDate(yesterday));

        LocalDateTime now = LocalDateTime.now();
        for (AttendanceLog log : logs) {
            if (log.getCheckOutTime() == null && log.getCheckInTime() != null) {
                long hoursOpen = ChronoUnit.HOURS.between(log.getCheckInTime(), now);
                if (hoursOpen >= LONG_CHECKIN_THRESHOLD_HOURS) {
                    User employee = log.getUser();
                    notificationService.notify(employee,
                            "You have been checked in for over " + LONG_CHECKIN_THRESHOLD_HOURS +
                                    " hours without checking out. Please check out or contact your manager.");
                    if (employee.getManager() != null) {
                        notificationService.notify(employee.getManager(),
                                employee.getName() + " (" + employee.getEmployeeId() +
                                        ") has an open check-in exceeding " + LONG_CHECKIN_THRESHOLD_HOURS + " hours and may need a correction.");
                    }
                }
            }
        }
    }
}
