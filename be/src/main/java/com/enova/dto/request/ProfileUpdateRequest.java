package com.enova.dto.request;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String displayName;
    private String nativeLanguage;
    private String cefrLevel;
    private String targetLevel;
    private Integer dailyGoalMinutes;
    private String preferredAccent;
    private String careerIndustry;
    private String careerGoal;
}
