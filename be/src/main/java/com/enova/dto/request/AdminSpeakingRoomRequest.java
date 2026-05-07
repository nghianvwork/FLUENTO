package com.enova.dto.request;

import lombok.Data;

@Data
public class AdminSpeakingRoomRequest {
    private String title;
    private String topic;
    private Integer maxParticipants;
    private String difficultyLevel;
    private String roomType;
    private String status;
    private String host;
}
