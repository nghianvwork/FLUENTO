package com.enova.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeResponse {
    private Long id;
    private String title;
    private String desc;
    private String type; // DAILY, WEEKLY
    private int progress;
    private int goal;
    private String reward;
    private String icon;
    private boolean isClaimed;
}
