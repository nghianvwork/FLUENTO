package com.enova.dto.response;

import com.enova.model.ContentTranslation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentTranslationResponse {
    private Long id;
    private Long contentId;
    private String contentTitle;
    private String originalText;
    private String translatedText;
    private String sourceLanguage;
    private String targetLanguage;
    private Integer timestampSeconds;
    private LocalDateTime createdAt;

    public static ContentTranslationResponse from(ContentTranslation translation) {
        return ContentTranslationResponse.builder()
                .id(translation.getId())
                .contentId(translation.getContent().getId())
                .contentTitle(translation.getContent().getTitle())
                .originalText(translation.getOriginalText())
                .translatedText(translation.getTranslatedText())
                .sourceLanguage(translation.getSourceLanguage())
                .targetLanguage(translation.getTargetLanguage())
                .timestampSeconds(translation.getTimestampSeconds())
                .createdAt(translation.getCreatedAt())
                .build();
    }
}
