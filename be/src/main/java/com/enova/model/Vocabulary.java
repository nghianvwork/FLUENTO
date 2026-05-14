package com.enova.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    private String phonetic;

    @Column(length = 50)
    private String partOfSpeech;

    @Column(columnDefinition = "TEXT")
    private String meaningVi;

    @Column(columnDefinition = "TEXT")
    private String exampleSentence;

    @Column(columnDefinition = "JSON")
    private String exampleSentences;

    @Column(length = 500)
    private String audioUrl;

    @Column(columnDefinition = "JSON")
    private String synonyms;

    @Column(columnDefinition = "JSON")
    private String antonyms;

    @Column(length = 30)
    @Builder.Default
    private String source = "MANUAL";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "career_path_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
