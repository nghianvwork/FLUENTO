package com.enova.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "challenges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Challenge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 255)
    private String description;

    @Column(length = 20)
    private String challengeType; // "DAILY", "WEEKLY"

    @Column(length = 50)
    private String metricType; // "ROLEPLAY", "VOCAB", "ROOM"

    @Builder.Default
    private Integer goal = 1;

    @Column(length = 50)
    private String reward;

    @Column(length = 10)
    private String icon;

    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
