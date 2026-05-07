package com.enova.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "performance_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate reportPeriodStart;

    @Column(nullable = false)
    private LocalDate reportPeriodEnd;

    @Builder.Default
    private Integer overallScore = 0;

    @Column(columnDefinition = "JSON")
    private String grammarAnalysisJson;

    @Column(columnDefinition = "JSON")
    private String vocabularyAnalysisJson;

    @Column(columnDefinition = "JSON")
    private String pronunciationAnalysisJson;

    @Column(columnDefinition = "JSON")
    private String strengthMapJson;

    @Column(columnDefinition = "JSON")
    private String errorPatternsJson;

    @Column(columnDefinition = "JSON")
    private String peerBenchmarkJson;

    @Enumerated(EnumType.STRING)
    private UserProfile.CefrLevel cefrEstimate;

    @Column(columnDefinition = "JSON")
    private String recommendationsJson;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
