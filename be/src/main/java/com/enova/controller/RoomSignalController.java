package com.enova.controller;

import com.enova.dto.ws.RoomSignalMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class RoomSignalController {

    @MessageMapping("/rooms/{roomId}/signal")
    @SendTo("/topic/rooms/{roomId}")
    public RoomSignalMessage signal(@DestinationVariable Long roomId, RoomSignalMessage message) {
        message.setRoomId(roomId);
        return message;
    }
}
