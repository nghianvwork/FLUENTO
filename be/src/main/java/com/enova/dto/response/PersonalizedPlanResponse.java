package com.enova.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalizedPlanResponse {
    private Long id;
    private String title;
    private String summary;
    private String cefrLevel;
    private String targetLevel;
    private Integer dailyGoalMinutes;
    private String planJson;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
