package com.enova.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "personalized_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalizedPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 60)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(nullable = false, length = 8)
    private String cefrLevel;

    @Column(nullable = false, length = 8)
    private String targetLevel;

    @Column(nullable = false)
    @Builder.Default
    private Integer dailyGoalMinutes = 15;

    @Column(columnDefinition = "JSON")
    private String planJson;

    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
