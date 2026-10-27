package com.eams.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;

/**
 * Stores which days of the week are configured as organization weekends.
 * A row exists for each DayOfWeek that is considered a non-working day.
 */
@Entity
@Table(name = "weekend_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeekendConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private DayOfWeek dayOfWeek;
}
