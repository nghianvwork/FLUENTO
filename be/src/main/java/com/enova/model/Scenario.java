package com.enova.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scenarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Scenario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScenarioCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AiPersonality aiPersonality;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contextPrompt;

    @Column(length = 500)
    private String tags;

    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ScenarioCategory {
        INTERVIEW, PRESENTATION, MEETING, CUSTOMER_SERVICE,
        NEGOTIATION, NETWORKING, EMAIL, HEALTHCARE,
        TRAVEL, WORKPLACE, DAILY_LIFE
    }

    public enum Difficulty {
        BEGINNER, INTERMEDIATE, ADVANCED
    }

    public enum AiPersonality {
        FRIENDLY, PROFESSIONAL, DIFFICULT, CASUAL
    }
}
