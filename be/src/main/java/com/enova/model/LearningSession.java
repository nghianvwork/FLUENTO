package com.enova.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionType sessionType;

    @Column(nullable = false)
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Builder.Default
    private Integer itemsCompleted = 0;

    @Builder.Default
    private Integer correctCount = 0;

    private Integer avgResponseTimeMs;

    @Builder.Default
    private Integer difficultyAdjustments = 0;

    @Builder.Default
    private Integer xpEarned = 0;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum SessionType {
        ROLEPLAY, VOCABULARY, LESSON, PRONUNCIATION, CONTENT, SPEAKING_ROOM
    }
}
