package com.enova.scheduler;

import com.enova.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationScheduler {
    private final NotificationService notificationService;

    @Scheduled(cron = "${notification.reminder-cron:0 0 8 * * *}")
    public void scheduleDailyReminders() {
        notificationService.createDailyReminders();
    }
}
