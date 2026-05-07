package com.enova.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ContentAiSummaryResponse {
    private Long contentId;
    private String summary;
    private List<String> keyVocabulary;
    private List<String> discussionQuestions;
}
