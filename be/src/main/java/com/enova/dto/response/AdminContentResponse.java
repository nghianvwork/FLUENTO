package com.enova.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminContentResponse {
    private Long id;
    private String title;
    private String type;
    private String topic;
    private String difficulty;
    private String status;
    private String owner;
    private LocalDateTime updatedAt;
}
