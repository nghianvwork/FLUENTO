package com.enova.dto.response;

import com.enova.model.ContentTest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentTestResponse {
    private Long id;
    private Long contentId;
    private String title;
    private String description;
    private String type;
    private Integer timeLimit;
    private Integer passingScore;
    private List<ContentTestQuestionResponse> questions;
    private LocalDateTime createdAt;

    public static ContentTestResponse from(ContentTest test, List<ContentTestQuestionResponse> questions) {
        return ContentTestResponse.builder()
                .id(test.getId())
                .contentId(test.getContent().getId())
                .title(test.getTitle())
                .description(test.getDescription())
                .type(test.getType().name())
                .timeLimit(test.getTimeLimit())
                .passingScore(test.getPassingScore())
                .questions(questions)
                .createdAt(test.getCreatedAt())
                .build();
    }
}
