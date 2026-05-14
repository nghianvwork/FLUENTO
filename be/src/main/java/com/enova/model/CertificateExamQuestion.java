package com.enova.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "certificate_exam_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateExamQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private CertificateExamSection section;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType questionType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String prompt;

    @Column(columnDefinition = "JSON")
    private String optionsJson;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Builder.Default
    private Integer points = 1;

    @Builder.Default
    private Integer orderIndex = 0;

    public enum QuestionType {
        MULTIPLE_CHOICE,
        FILL_BLANK,
        SENTENCE_ORDER,
        SHORT_ANSWER
    }
}
