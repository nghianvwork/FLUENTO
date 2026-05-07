package com.enova.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pronunciation_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PronunciationRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String textPrompt;

    @Column(length = 500)
    private String audioUrl;

    @Builder.Default
    private Integer accuracyScore = 0;

    @Builder.Default
    private Integer intonationScore = 0;

    @Builder.Default
    private Integer rhythmScore = 0;

    @Builder.Default
    private Integer stressScore = 0;

    @Builder.Default
    private Integer speedWpm = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UserProfile.AccentPreference accentType = UserProfile.AccentPreference.AMERICAN;

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
