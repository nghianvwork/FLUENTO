package com.enova.dto.response;

import com.enova.model.StructuredLesson;
import com.enova.model.StructuredLessonProgress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StructuredLessonResponse {
    private Long id;
    private String levelCode;
    private String title;
    private String description;
    private String lessonType;
    private Integer orderIndex;
    private Integer estimatedMinutes;
    private String contentJson;
    private String status;
    private Integer score;
    private Integer completedBlocks;
    private Integer totalBlocks;
    private LocalDateTime createdAt;

    public static StructuredLessonResponse from(StructuredLesson lesson, StructuredLessonProgress progress, boolean includeContent) {
        int totalBlocks = 0;
        int completedBlocks = 0;
        if (lesson.getContentJson() != null) {
            try {
                com.fasterxml.jackson.databind.JsonNode nodes = new com.fasterxml.jackson.databind.ObjectMapper().readTree(lesson.getContentJson());
                if (nodes.isArray()) {
                    totalBlocks = nodes.size();
                }
            } catch (Exception ignored) {
            }
        }
        if (progress != null && progress.getStatus() == StructuredLessonProgress.ProgressStatus.COMPLETED) {
            completedBlocks = totalBlocks;
        }
        return StructuredLessonResponse.builder()
                .id(lesson.getId())
                .levelCode(lesson.getLevelCode())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .lessonType(lesson.getLessonType().name())
                .orderIndex(lesson.getOrderIndex())
                .estimatedMinutes(lesson.getEstimatedMinutes())
                .contentJson(includeContent ? lesson.getContentJson() : null)
                .status(progress != null ? progress.getStatus().name() : StructuredLessonProgress.ProgressStatus.NOT_STARTED.name())
                .score(progress != null ? progress.getScore() : null)
                .completedBlocks(completedBlocks)
                .totalBlocks(totalBlocks)
                .createdAt(lesson.getCreatedAt())
                .build();
    }
}
