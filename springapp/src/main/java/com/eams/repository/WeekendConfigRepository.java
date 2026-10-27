package com.eams.repository;

import com.eams.entity.WeekendConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.Optional;

public interface WeekendConfigRepository extends JpaRepository<WeekendConfig, Long> {
    Optional<WeekendConfig> findByDayOfWeek(DayOfWeek dayOfWeek);
}
