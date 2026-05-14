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
public class ContentTestQuestionResponse {
    private Long id;
    private String question;
    private String questionType;
    private String options;
    private Integer points;
    private Integer orderIndex;

    public static ContentTestQuestionResponse from(ContentTestQuestion question) {
        String type = question.getQuestionType() != null
            ? question.getQuestionType().name()
            : com.enova.model.ContentTestQuestion.QuestionType.MULTIPLE_CHOICE.name();
        return ContentTestQuestionResponse.builder()
                .id(question.getId())
                .question(question.getQuestion())
            .questionType(type)
                .options(question.getOptions())
                .points(question.getPoints())
                .orderIndex(question.getOrderIndex())
                .build();
    }
}
