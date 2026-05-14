package com.enova.controller;

import com.enova.dto.request.PersonalizedPlanRequest;
import com.enova.dto.response.ApiResponse;
import com.enova.dto.response.PersonalizedPlanResponse;
import com.enova.model.User;
import com.enova.service.PersonalizedPlanService;
import com.enova.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/personalized")
@RequiredArgsConstructor
public class PersonalizedPlanController {

    private final PersonalizedPlanService planService;
    private final UserService userService;

    @GetMapping("/plan")
    public ResponseEntity<ApiResponse<PersonalizedPlanResponse>> getPlan(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        Optional<PersonalizedPlanResponse> plan = planService.getActivePlan(user.getId());
        return ResponseEntity.ok(ApiResponse.success(plan.orElse(null)));
    }

    @PostMapping("/plan")
    public ResponseEntity<ApiResponse<PersonalizedPlanResponse>> generatePlan(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PersonalizedPlanRequest request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(planService.generatePlan(user.getId(), request)));
    }
}
