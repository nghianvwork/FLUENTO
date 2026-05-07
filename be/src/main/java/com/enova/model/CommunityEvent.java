package com.enova.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "community_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "time_label", nullable = false, length = 100)
    private String timeLabel;

    @Column(nullable = false, length = 120)
    private String host;

    @Column(nullable = false)
    @Builder.Default
    private Integer capacity = 40;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
