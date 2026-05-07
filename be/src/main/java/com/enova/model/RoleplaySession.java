package com.enova.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "roleplay_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleplaySession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scenario_id", nullable = false)
    private Scenario scenario;

    @Column(columnDefinition = "JSON")
    private String conversationJson;

    @Column(columnDefinition = "JSON")
    private String errorsJson;

    @Column(columnDefinition = "TEXT")
    private String feedbackSummary;

    private Integer durationSeconds;

    private Integer score;

    @Column(length = 500)
    private String audioUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SessionStatus status = SessionStatus.IN_PROGRESS;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime completedAt;

    public enum SessionStatus {
        IN_PROGRESS, COMPLETED, ABANDONED
    }
}
