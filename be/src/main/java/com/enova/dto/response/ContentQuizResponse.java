package com.enova.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ContentQuizResponse {
    private Long id;
    private Long contentId;
    private String question;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctAnswer;
    private String explanation;
    private Boolean userAnswered;
    private Boolean userCorrect;
}
