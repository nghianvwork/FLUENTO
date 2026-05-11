package com.enova.service;

import com.enova.dto.response.NotificationResponse;
import com.enova.exception.ResourceNotFoundException;
import com.enova.model.Notification;
import com.enova.model.User;
import com.enova.model.UserProfile;
import com.enova.repository.NotificationRepository;
import com.enova.repository.UserProfileRepository;
import com.enova.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;

    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification notification : notifications) {
            if (!Boolean.TRUE.equals(notification.getIsRead())) {
                notification.setIsRead(true);
            }
        }
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void createDailyReminders() {
        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.plusDays(1).atStartOfDay().minusNanos(1);

        List<UserProfile> profiles = profileRepository.findAll();
        for (UserProfile profile : profiles) {
            User user = profile.getUser();
            if (user == null) {
                continue;
            }

            boolean alreadySent = notificationRepository.existsByUserIdAndTypeAndCreatedAtBetween(
                    user.getId(), Notification.NotificationType.REMINDER, dayStart, dayEnd);
            if (alreadySent) {
                continue;
            }

            LocalDate lastStudy = profile.getLastStudyDate() != null
                    ? profile.getLastStudyDate().toLocalDate()
                    : null;
            if (lastStudy != null && lastStudy.isEqual(today)) {
                continue;
            }

            String title = "Nho hoc tap hom nay";
            String message = "Duy tri streak bang cach hoc it nhat "
                    + profile.getDailyGoalMinutes() + " phut.";

            notificationRepository.save(Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(Notification.NotificationType.REMINDER)
                    .isRead(false)
                    .build());
        }
    }

    @Transactional
    public void createNotification(Long userId, String title, String message, Notification.NotificationType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        notificationRepository.save(Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build());
    }
}
