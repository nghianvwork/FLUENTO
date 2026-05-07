package com.enova.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "content_tests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentTest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id")
    private ContentItem content;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TestType type = TestType.MULTIPLE_CHOICE;

    @Column(nullable = false)
    @Builder.Default
    private Integer timeLimit = 30;

    @Column(nullable = false)
    @Builder.Default
    private Integer passingScore = 70;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    public enum TestType {
        MULTIPLE_CHOICE,
        TRUE_FALSE,
        FILL_IN_BLANK,
        MIXED
    }
}
