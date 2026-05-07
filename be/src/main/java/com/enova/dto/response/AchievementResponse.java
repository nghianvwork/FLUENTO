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
public class AchievementResponse {
    private Long id;
    private String achievementKey;
    private String title;
    private String desc;
    private String icon;
    private Integer xpReward;
    private int progress; // 0 to 100
    private boolean isEarned;
    private LocalDateTime earnedAt;
}
