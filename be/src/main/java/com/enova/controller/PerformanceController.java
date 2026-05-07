package com.enova.controller;

import com.enova.dto.response.ApiResponse;
import com.enova.model.*;
import com.enova.service.PerformanceService;
import com.enova.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
public class PerformanceController {
    private final PerformanceService performanceService;
    private final UserService userService;

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<List<PerformanceReport>>> getReports(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(performanceService.getUserReports(user.getId())));
    }

    @PostMapping("/reports/generate")
    public ResponseEntity<ApiResponse<PerformanceReport>> generateReport(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(performanceService.generateWeeklyReport(user.getId())));
    }
}
