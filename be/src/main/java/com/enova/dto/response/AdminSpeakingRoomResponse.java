package com.enova.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminSpeakingRoomResponse {
    private Long id;
    private String title;
    private String topic;
    private String status;
    private String host;
    private int participants;
    private int capacity;
}
