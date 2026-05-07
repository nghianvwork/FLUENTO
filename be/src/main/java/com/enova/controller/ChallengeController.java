package com.enova.controller;

import com.enova.dto.response.ApiResponse;
import com.enova.dto.response.ChallengeResponse;
import com.enova.model.User;
import com.enova.service.ChallengeService;
import com.enova.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v2/challenges")
@RequiredArgsConstructor
public class ChallengeController {
    private final ChallengeService challengeService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChallengeResponse>>> getChallenges(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        List<ChallengeResponse> challenges = challengeService.getActiveChallenges(user);
        return ResponseEntity.ok(ApiResponse.success(challenges));
    }

    @PostMapping("/{id}/claim")
    public ResponseEntity<ApiResponse<Boolean>> claimReward(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        boolean success = challengeService.claimReward(user, id);
        if (success) {
            return ResponseEntity.ok(ApiResponse.success(true));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Cannot claim reward yet"));
        }
    }
}
