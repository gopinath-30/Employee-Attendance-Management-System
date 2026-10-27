
package com.eams.service;

import com.eams.entity.WeekendConfig;
import com.eams.exception.BadRequestException;
import com.eams.repository.WeekendConfigRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.Collections;
import java.util.List;

@Service
public class WeekendConfigService {

    private final WeekendConfigRepository weekendConfigRepository;

    public WeekendConfigService(
            WeekendConfigRepository weekendConfigRepository) {

        this.weekendConfigRepository = weekendConfigRepository;
    }

    @Transactional(readOnly = true)
    public List<DayOfWeek> getWeekendDays() {

        return weekendConfigRepository.findAll()
                .stream()
                .map(WeekendConfig::getDayOfWeek)
                .toList();
    }

    @Transactional
    public List<DayOfWeek> updateWeekendDays(
            List<String> days) {

        if (days == null) {
            throw new BadRequestException(
                    "weekendDays cannot be null"
            );
        }

        if (days.size() > 7) {
            throw new BadRequestException(
                    "A maximum of 7 weekend days can be configured"
            );
        }

        List<DayOfWeek> parsed;

        try {

            parsed = days.stream()
                    .filter(d -> d != null && !d.isBlank())
                    .map(d ->
                            DayOfWeek.valueOf(
                                    d.trim().toUpperCase()
                            )
                    )
                    .distinct()
                    .toList();

        } catch (IllegalArgumentException ex) {

            throw new BadRequestException(
                    "Invalid weekend day. Use values such as SATURDAY or SUNDAY"
            );
        }

        weekendConfigRepository.deleteAll();

        parsed.forEach(day ->
                weekendConfigRepository.save(
                        WeekendConfig.builder()
                                .dayOfWeek(day)
                                .build()
                )
        );

        return parsed;
    }
}
