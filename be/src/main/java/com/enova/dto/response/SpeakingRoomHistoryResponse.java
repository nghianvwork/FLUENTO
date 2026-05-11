package com.enova.dto.response;

import com.enova.model.RoomParticipant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeakingRoomHistoryResponse {
    private Long id;
    private Long roomId;
    private String roomTitle;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    private Long durationSeconds;
    private Integer speakingTimeSeconds;

    public static SpeakingRoomHistoryResponse from(RoomParticipant participant) {
        LocalDateTime joined = participant.getJoinedAt();
        LocalDateTime left = participant.getLeftAt();
        long duration = 0;
        if (joined != null) {
            LocalDateTime endTime = left != null ? left : LocalDateTime.now();
            duration = Math.max(0, Duration.between(joined, endTime).getSeconds());
        }

        return SpeakingRoomHistoryResponse.builder()
                .id(participant.getId())
                .roomId(participant.getRoom().getId())
                .roomTitle(participant.getRoom().getTitle())
                .joinedAt(joined)
                .leftAt(left)
                .durationSeconds(duration)
                .speakingTimeSeconds(participant.getSpeakingTimeSeconds())
                .build();
    }
}
