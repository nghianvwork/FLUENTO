package com.enova.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "speaking_rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeakingRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String topic;

    @Builder.Default
    private Integer maxParticipants = 5;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Scenario.Difficulty difficultyLevel = Scenario.Difficulty.INTERMEDIATE;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RoomType roomType = RoomType.DISCUSSION;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RoomStatus status = RoomStatus.ACTIVE;

    @Builder.Default
    private Integer currentParticipants = 0;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum RoomType {
        DISCUSSION, DEBATE
    }

    public enum RoomStatus {
        ACTIVE, FULL, CLOSED
    }
}
