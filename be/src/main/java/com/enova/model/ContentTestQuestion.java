package com.enova.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "content_test_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentTestQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id")
    private ContentTest test;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(columnDefinition = "JSON")
    private String options;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(nullable = false)
    @Builder.Default
    private Integer points = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;
}
