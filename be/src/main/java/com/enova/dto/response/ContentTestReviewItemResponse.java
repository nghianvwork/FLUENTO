package com.enova.dto.response;

import com.enova.model.ContentTestQuestion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentTestReviewItemResponse {
    private Long questionId;
    private String question;
    private String questionType;
    private String userAnswer;
    private String correctAnswer;
    private Boolean isCorrect;
    private String explanation;
    private Integer points;
    private Integer pointsEarned;

    public static ContentTestReviewItemResponse of(ContentTestQuestion question,
                                                   String userAnswer,
                                                   String correctAnswer,
                                                   boolean isCorrect,
                                                   int pointsEarned) {
        String type = question.getQuestionType() != null
            ? question.getQuestionType().name()
            : com.enova.model.ContentTestQuestion.QuestionType.MULTIPLE_CHOICE.name();
        return ContentTestReviewItemResponse.builder()
                .questionId(question.getId())
                .question(question.getQuestion())
            .questionType(type)
                .userAnswer(userAnswer)
                .correctAnswer(correctAnswer)
                .isCorrect(isCorrect)
                .explanation(question.getExplanation())
                .points(question.getPoints())
                .pointsEarned(pointsEarned)
                .build();
    }
}
