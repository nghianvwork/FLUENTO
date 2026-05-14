package com.enova.dto.response;

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
public class StructuredLessonProgressResponse {
    private Long lessonId;
    private String status;
    private Integer score;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    public static StructuredLessonProgressResponse from(StructuredLessonProgress progress) {
        return StructuredLessonProgressResponse.builder()
                .lessonId(progress.getLesson().getId())
                .status(progress.getStatus().name())
                .score(progress.getScore())
                .startedAt(progress.getStartedAt())
                .completedAt(progress.getCompletedAt())
                .build();
    }
}
