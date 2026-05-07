package com.enova.dto.request;

import lombok.Data;

@Data
public class ContentVocabularyRequest {
    private Long contentId;
    private String word;
    private String definition;
    private String exampleSentence;
    private Integer timestampSeconds;
}
