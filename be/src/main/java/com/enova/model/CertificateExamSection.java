package com.enova.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "certificate_exam_sections")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateExamSection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private CertificateExam exam;

    @Column(nullable = false, length = 120)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SectionType sectionType;

    @Builder.Default
    private Integer orderIndex = 0;

    @Builder.Default
    private Integer timeLimitMinutes = 20;

    public enum SectionType {
        LISTENING, READING, WRITING, SPEAKING
    }
}
