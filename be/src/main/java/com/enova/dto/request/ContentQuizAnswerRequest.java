package com.enova.dto.request;

import lombok.Data;

@Data
public class ContentQuizAnswerRequest {
    private Long quizId;
    private String answer;
}
