package com.enova.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vocabulary_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vocabulary_id", nullable = false)
    private Vocabulary vocabulary;

    @Builder.Default
    private Integer masteryLevel = 0;

    private LocalDateTime nextReviewAt;

    @Builder.Default
    private Double easeFactor = 2.5;

    @Builder.Default
    private Integer intervalDays = 1;

    @Builder.Default
    private Integer reviewCount = 0;

    @Builder.Default
    private Integer correctCount = 0;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime lastReviewedAt;
}
