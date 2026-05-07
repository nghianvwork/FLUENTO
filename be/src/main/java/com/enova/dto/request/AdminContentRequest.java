package com.enova.dto.request;

import lombok.Data;

@Data
public class AdminContentRequest {
    private String title;
    private String sourceUrl;
    private String sourceType;
    private String thumbnailUrl;
    private Integer durationSeconds;
    private String difficulty;
    private String topic;
    private String transcript;
    private String summary;
    private String tags;
    private Boolean isActive;
    private String owner;
}
