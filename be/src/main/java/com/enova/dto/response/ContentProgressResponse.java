package com.enova.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class ContentProgressResponse {
    private Long contentId;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
