package com.enova.dto.request;

import lombok.Data;

@Data
public class AiEmotionRequest {
    private String text;
    private String context;
}
