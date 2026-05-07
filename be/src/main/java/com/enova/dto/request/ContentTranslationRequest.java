package com.enova.dto.request;

import lombok.Data;

@Data
public class ContentTranslationRequest {
    private String originalText;
    private String sourceLanguage;
    private String targetLanguage;
    private Integer timestampSeconds;
}
