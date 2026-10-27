package com.eams.service;

import com.eams.entity.AttendanceStatus;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Pure calculation helper for work hours and attendance status.
 * Uses java.time exclusively - never string manipulation.
 */
@Component
public class AttendanceCalculator {

    private static final double FULL_DAY_HOURS = 8.0;
    private static final double HALF_DAY_HOURS = 4.0;

    public double calculateWorkHours(LocalDateTime checkIn, LocalDateTime checkOut) {
        if (checkIn == null || checkOut == null) {
            return 0.0;
        }
        Duration duration = Duration.between(checkIn, checkOut);
        double hours = duration.toMinutes() / 60.0;
        return Math.round(hours * 100.0) / 100.0;
    }

    public AttendanceStatus calculateStatus(double workHours) {
        if (workHours >= FULL_DAY_HOURS) {
            return AttendanceStatus.PRESENT;
        } else if (workHours >= HALF_DAY_HOURS) {
            return AttendanceStatus.HALF_DAY;
        } else {
            return AttendanceStatus.PARTIAL;
        }
    }
}
