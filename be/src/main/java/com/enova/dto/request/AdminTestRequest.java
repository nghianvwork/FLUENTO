package com.enova.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class AdminTestRequest {
    private Long contentId;
    private String title;
    private String description;
    private String type;
    private Integer timeLimit;
    private Integer passingScore;
    private Boolean isActive;
    private List<AdminTestQuestionRequest> questions;
}
