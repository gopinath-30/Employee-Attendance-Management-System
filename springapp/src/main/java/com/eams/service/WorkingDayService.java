package com.eams.service;

import com.eams.repository.HolidayRepository;
import com.eams.repository.WeekendConfigRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Determines whether a given calendar date is a working day,
 * taking configured weekends and holidays into account.
 */
@Service
public class WorkingDayService {

    private final HolidayRepository holidayRepository;
    private final WeekendConfigRepository weekendConfigRepository;

    public WorkingDayService(HolidayRepository holidayRepository, WeekendConfigRepository weekendConfigRepository) {
        this.holidayRepository = holidayRepository;
        this.weekendConfigRepository = weekendConfigRepository;
    }

    public Set<DayOfWeek> getConfiguredWeekends() {
        return weekendConfigRepository.findAll().stream()
                .map(com.eams.entity.WeekendConfig::getDayOfWeek)
                .collect(Collectors.toSet());
    }

    public boolean isWeekend(LocalDate date, Set<DayOfWeek> weekends) {
        return weekends.contains(date.getDayOfWeek());
    }

    public boolean isHoliday(LocalDate date) {
        return holidayRepository.existsByDate(date);
    }

    public boolean isWorkingDay(LocalDate date, Set<DayOfWeek> weekends) {
        return !isWeekend(date, weekends) && !isHoliday(date);
    }

    public java.util.List<LocalDate> getWorkingDaysInMonth(int year, int month) {
        Set<DayOfWeek> weekends = getConfiguredWeekends();
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        java.util.List<LocalDate> days = new java.util.ArrayList<>();
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            if (isWorkingDay(d, weekends)) {
                days.add(d);
            }
        }
        return days;
    }
}
