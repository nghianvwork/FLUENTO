package com.enova.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ContentVocabularyResponse {
    private Long id;
    private Long contentId;
    private String contentTitle;
    private String word;
    private String definition;
    private String exampleSentence;
    private Integer timestampSeconds;
    private LocalDateTime createdAt;
}
