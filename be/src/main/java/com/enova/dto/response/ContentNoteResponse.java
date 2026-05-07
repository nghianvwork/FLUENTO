package com.enova.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ContentNoteResponse {
    private Long id;
    private Long contentId;
    private String noteText;
    private Integer timestampSeconds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
