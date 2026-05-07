package com.enova.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 50)
    private String displayName;

    @Column(length = 20)
    private String nativeLanguage;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CefrLevel cefrLevel = CefrLevel.A1;

    @Enumerated(EnumType.STRING)
    private CefrLevel targetLevel;

    @Builder.Default
    private Integer dailyGoalMinutes = 15;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AccentPreference preferredAccent = AccentPreference.AMERICAN;

    @Column(length = 100)
    private String careerIndustry;

    @Column(length = 255)
    private String careerGoal;

    @Builder.Default
    private Integer streakCount = 0;

    @Builder.Default
    private Integer totalXp = 0;

    @Builder.Default
    private Integer totalLessonsCompleted = 0;

    @Builder.Default
    private Integer totalRoleplayMinutes = 0;

    @Builder.Default
    private Integer totalWordsLearned = 0;

    private LocalDateTime lastStudyDate;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum CefrLevel {
        A1, A2, B1, B2, C1, C2
    }

    public enum AccentPreference {
        AMERICAN, BRITISH, AUSTRALIAN, SINGAPORE
    }
}
