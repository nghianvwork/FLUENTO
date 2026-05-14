package com.enova.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "structured_lessons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StructuredLesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 8)
    private String levelCode;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LessonType lessonType = LessonType.GRAMMAR;

    @Column(columnDefinition = "JSON")
    private String contentJson;

    @Builder.Default
    private Integer orderIndex = 0;

    @Builder.Default
    private Integer estimatedMinutes = 15;

    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum LessonType {
        VOCABULARY, GRAMMAR, SPEAKING, LISTENING, WRITING, READING
    }
}
