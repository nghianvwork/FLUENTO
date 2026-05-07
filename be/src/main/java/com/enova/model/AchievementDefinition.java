package com.enova.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "achievement_definitions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AchievementDefinition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String achievementKey;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 255)
    private String description;

    @Column(length = 10)
    private String icon;

    @Builder.Default
    private Integer xpReward = 0;

    @Column(columnDefinition = "JSON")
    private String criteriaJson;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
