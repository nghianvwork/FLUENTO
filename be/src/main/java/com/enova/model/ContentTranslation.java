package com.enova.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "content_translations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"content_id", "user_id", "original_text"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentTranslation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id")
    private ContentItem content;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String originalText;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String translatedText;

    @Column(length = 10)
    private String sourceLanguage;

    @Column(length = 10)
    private String targetLanguage;

    private Integer timestampSeconds;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
