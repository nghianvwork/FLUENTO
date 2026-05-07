package com.enova.dto.response;

import com.enova.model.ContentTestAttempt;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentTestAttemptResponse {
    private Long id;
    private Long testId;
    private String testTitle;
    private Integer score;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Integer timeSpent;
    private Boolean passed;
    private String answers;
    private LocalDateTime createdAt;

    public static ContentTestAttemptResponse from(ContentTestAttempt attempt) {
        return ContentTestAttemptResponse.builder()
                .id(attempt.getId())
                .testId(attempt.getTest().getId())
                .testTitle(attempt.getTest().getTitle())
                .score(attempt.getScore())
                .totalQuestions(attempt.getTotalQuestions())
                .correctAnswers(attempt.getCorrectAnswers())
                .timeSpent(attempt.getTimeSpent())
                .passed(attempt.getPassed())
                .answers(attempt.getAnswers())
                .createdAt(attempt.getCreatedAt())
                .build();
    }
}
