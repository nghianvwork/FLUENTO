package com.enova.dto.request;

import lombok.Data;

@Data
public class AdminTestQuestionRequest {
    private Long id;
    private String question;
    private String questionType;
    private String options;
    private String correctAnswer;
    private String explanation;
    private Integer points;
    private Integer orderIndex;
}
