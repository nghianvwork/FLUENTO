package com.enova.dto.request;

import lombok.Data;

@Data
public class ContentAiSummaryRequest {
    private Long contentId;
    private String focus;
}
