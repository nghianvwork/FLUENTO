package com.enova.dto.request;

import lombok.Data;

@Data
public class PersonalizedPlanRequest {
    private String focus;
    private Integer dailyGoalMinutes;
}
