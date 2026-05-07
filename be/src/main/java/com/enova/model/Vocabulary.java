package com.enova.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vocabularies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vocabulary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String word;

    @Column(columnDefinition = "TEXT")
    private String definition;

    @Column(length = 100)
    private String pronunciationIpa;

    @Column(columnDefinition = "JSON")
    private String exampleSentences;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "career_path_id")
    private CareerPath careerPath;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Scenario.Difficulty difficulty = Scenario.Difficulty.BEGINNER;

    @Builder.Default
    private Integer frequencyRank = 0;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
