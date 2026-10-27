
package com.eams.controller;

import com.eams.dto.WeekendConfigRequest;
import com.eams.service.WeekendConfigService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final WeekendConfigService weekendConfigService;

    public SettingsController(
            WeekendConfigService weekendConfigService) {

        this.weekendConfigService = weekendConfigService;
    }

    @GetMapping("/weekends")
    public ResponseEntity<List<DayOfWeek>> getWeekends() {

        return ResponseEntity.ok(
                weekendConfigService.getWeekendDays()
        );
    }

    @PutMapping("/weekends")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateWeekends(
            @RequestBody WeekendConfigRequest request) {

        List<String> days = request.getWeekendDays();

        List<DayOfWeek> updated =
                weekendConfigService.updateWeekendDays(days);

        return ResponseEntity.ok(
                Map.of("weekendDays", updated)
        );
    }
}
