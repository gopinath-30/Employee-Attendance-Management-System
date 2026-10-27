
package com.eams.controller;

import com.eams.dto.NotificationResponse;
import com.eams.security.CurrentUserProvider;
import com.eams.service.NotificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserProvider currentUserProvider;

    public NotificationController(
            NotificationService notificationService,
            CurrentUserProvider currentUserProvider) {

        this.notificationService = notificationService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications() {

        Long userId =
                currentUserProvider
                        .getCurrentUser()
                        .getId();

        return ResponseEntity.ok(
                notificationService.getForUser(userId)
        );
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(
            @PathVariable Long id) {

        Long userId =
                currentUserProvider
                        .getCurrentUser()
                        .getId();

        notificationService.markRead(id, userId);

        return ResponseEntity.ok().build();
    }
}
