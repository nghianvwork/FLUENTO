package com.enova.controller;

import com.enova.dto.response.AchievementResponse;
import com.enova.dto.response.ApiResponse;
import com.enova.model.User;
import com.enova.service.AchievementService;
import com.enova.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v2/achievements")
@RequiredArgsConstructor
public class AchievementController {
    private final AchievementService achievementService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AchievementResponse>>> getAchievements(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        List<AchievementResponse> achievements = achievementService.getUserAchievements(user);
        return ResponseEntity.ok(ApiResponse.success(achievements));
    }
}
