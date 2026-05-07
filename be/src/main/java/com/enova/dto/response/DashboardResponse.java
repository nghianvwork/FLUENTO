package com.enova.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class DashboardResponse {
    private int streakCount;
    private int totalXp;
    private int wordsLearned;
    private int lessonsCompleted;
    private int roleplayMinutes;
    private String cefrLevel;
    private int dailyGoalMinutes;
    private int todayMinutes;
    private double todayProgress;
}
