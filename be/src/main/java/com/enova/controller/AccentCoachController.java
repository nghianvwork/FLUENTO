package com.enova.controller;

import com.enova.dto.response.ApiResponse;
import com.enova.model.*;
import com.enova.service.AccentCoachService;
import com.enova.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accent")
@RequiredArgsConstructor
public class AccentCoachController {
    private final AccentCoachService accentCoachService;
    private final UserService userService;

    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<PronunciationRecord>> analyze(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                accentCoachService.analyzePronunciation(user.getId(), request.get("text"), request.get("audioUrl"))));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<PronunciationRecord>>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(accentCoachService.getUserHistory(user.getId())));
    }
}
