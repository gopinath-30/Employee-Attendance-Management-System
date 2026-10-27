package com.eams.service;

import com.eams.entity.AttendanceStatus;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AttendanceCalculatorTest {

    private final AttendanceCalculator calculator = new AttendanceCalculator();

    @Test
    void calculatesEightAndHalfHoursCorrectly() {
        LocalDateTime checkIn = LocalDateTime.of(2023, 6, 1, 9, 0);
        LocalDateTime checkOut = LocalDateTime.of(2023, 6, 1, 17, 30);
        double hours = calculator.calculateWorkHours(checkIn, checkOut);
        assertEquals(8.5, hours, 0.001);
    }

    @Test
    void statusIsPresentWhenHoursAtLeastEight() {
        assertEquals(AttendanceStatus.PRESENT, calculator.calculateStatus(8.0));
        assertEquals(AttendanceStatus.PRESENT, calculator.calculateStatus(9.5));
    }

    @Test
    void statusIsHalfDayBetweenFourAndEightHours() {
        assertEquals(AttendanceStatus.HALF_DAY, calculator.calculateStatus(4.0));
        assertEquals(AttendanceStatus.HALF_DAY, calculator.calculateStatus(7.99));
    }

    @Test
    void statusIsPartialUnderFourHours() {
        assertEquals(AttendanceStatus.PARTIAL, calculator.calculateStatus(3.99));
        assertEquals(AttendanceStatus.PARTIAL, calculator.calculateStatus(0.0));
    }
}
