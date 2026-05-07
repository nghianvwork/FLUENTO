package com.enova.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "content_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(length = 500)
    private String sourceUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SourceType sourceType;

    @Column(length = 500)
    private String thumbnailUrl;

    private Integer durationSeconds;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Scenario.Difficulty difficulty = Scenario.Difficulty.INTERMEDIATE;

    @Column(length = 100)
    private String topic;

    @Column(columnDefinition = "LONGTEXT")
    private String transcript;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(length = 500)
    private String tags;

    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum SourceType {
        YOUTUBE, PODCAST, ARTICLE, LINKEDIN
    }
}
