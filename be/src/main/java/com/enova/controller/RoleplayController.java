package com.enova.controller;

import com.enova.dto.request.RoleplayMessageRequest;
import com.enova.dto.response.ApiResponse;
import com.enova.model.*;
import com.enova.service.RoleplayService;
import com.enova.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roleplay")
@RequiredArgsConstructor
public class RoleplayController {
    private final RoleplayService roleplayService;
    private final UserService userService;

    @GetMapping("/scenarios")
    public ResponseEntity<ApiResponse<List<Scenario>>> getScenarios(
            @RequestParam(required = false) String category) {
        List<Scenario> scenarios = category != null
                ? roleplayService.getScenariosByCategory(Scenario.ScenarioCategory.valueOf(category))
                : roleplayService.getActiveScenarios();
        return ResponseEntity.ok(ApiResponse.success(scenarios));
    }

    @GetMapping("/scenarios/{id}")
    public ResponseEntity<ApiResponse<Scenario>> getScenario(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(roleplayService.getScenarioById(id)));
    }

    @PostMapping("/sessions/start")
    public ResponseEntity<ApiResponse<RoleplaySession>> startSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Long> request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(roleplayService.startSession(user.getId(), request.get("scenarioId"))));
    }

    @PostMapping("/sessions/message")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody RoleplayMessageRequest request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(roleplayService.sendMessage(request, user.getId())));
    }

    @PostMapping("/sessions/{id}/complete")
    public ResponseEntity<ApiResponse<RoleplaySession>> completeSession(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(roleplayService.completeSession(id)));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<RoleplaySession>>> getUserSessions(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(roleplayService.getUserSessions(user.getId())));
    }
}
