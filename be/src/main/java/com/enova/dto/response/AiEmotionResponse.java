package com.enova.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiEmotionResponse {
    private String emotion;
    private String confidence;
    private String coachingTone;
    private String suggestion;
}
