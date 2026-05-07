package com.enova.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "emotion_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmotionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private LearningSession session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DetectedEmotion detectedEmotion;

    @Builder.Default
    private Double confidence = 0.0;

    @Column(length = 200)
    private String triggerEvent;

    @Column(length = 200)
    private String adjustmentAction;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public enum DetectedEmotion {
        CONFIDENT, FRUSTRATED, BORED, ANXIOUS, EXCITED, NEUTRAL
    }
}
