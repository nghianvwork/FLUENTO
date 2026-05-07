package com.enova.controller;

import com.enova.dto.response.ApiResponse;
import com.enova.model.*;
import com.enova.service.SpeakingRoomService;
import com.enova.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/speaking")
@RequiredArgsConstructor
public class SpeakingRoomController {
    private final SpeakingRoomService speakingRoomService;
    private final UserService userService;

    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<SpeakingRoom>>> getActiveRooms() {
        return ResponseEntity.ok(ApiResponse.success(speakingRoomService.getActiveRooms()));
    }

    @PostMapping("/rooms/{roomId}/join")
    public ResponseEntity<ApiResponse<RoomParticipant>> joinRoom(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long roomId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(speakingRoomService.joinRoom(roomId, user.getId())));
    }

    @PostMapping("/rooms/{roomId}/leave")
    public ResponseEntity<ApiResponse<String>> leaveRoom(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long roomId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        speakingRoomService.leaveRoom(roomId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Left room successfully"));
    }
}
