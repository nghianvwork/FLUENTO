package com.enova.dto.ws;

import lombok.Data;

@Data
public class RoomSignalMessage {
    private String type;
    private String payload;
    private Long senderId;
    private Long roomId;
}
