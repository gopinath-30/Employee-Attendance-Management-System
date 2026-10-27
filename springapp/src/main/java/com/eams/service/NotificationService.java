
package com.eams.service;

import com.eams.dto.NotificationResponse;
import com.eams.entity.Notification;
import com.eams.entity.User;
import com.eams.exception.UnauthorizedException;
import com.eams.repository.NotificationRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository) {

        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void notify(User recipient, String message) {

        Notification notification =
                Notification.builder()
                        .recipient(recipient)
                        .message(message)
                        .read(false)
                        .createdAt(LocalDateTime.now())
                        .build();

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getForUser(Long userId) {

        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(n ->
                        NotificationResponse.builder()
                                .id(n.getId())
                                .message(n.getMessage())
                                .read(n.isRead())
                                .createdAt(n.getCreatedAt())
                                .build()
                )
                .toList();
    }

    @Transactional
    public void markRead(
            Long notificationId,
            Long currentUserId) {

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Notification not found"
                                )
                        );

        if (!notification
                .getRecipient()
                .getId()
                .equals(currentUserId)) {

            throw new UnauthorizedException(
                    "You may only update your own notifications"
            );
        }

        notification.setRead(true);

        notificationRepository.save(notification);
    }
}
