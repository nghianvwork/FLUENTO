package com.enova.dto.request;

import lombok.Data;

@Data
public class ContentNoteRequest {
    private Long contentId;
    private String noteText;
    private Integer timestampSeconds;
}
