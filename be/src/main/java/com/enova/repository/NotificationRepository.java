package com.enova.repository;

import com.enova.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDateTime;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndIsReadFalse(Long userId);
    boolean existsByUserIdAndTypeAndCreatedAtBetween(
            Long userId,
            Notification.NotificationType type,
            LocalDateTime start,
            LocalDateTime end
    );
}
