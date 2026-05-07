package com.enova.controller;

import com.enova.dto.response.ApiResponse;
import com.enova.dto.response.VocabularyProgressResponse;
import com.enova.model.User;
import com.enova.service.SrsService;
import com.enova.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v2/srs")
@RequiredArgsConstructor
public class SrsController {
    private final SrsService srsService;
    private final UserService userService;

    @GetMapping("/due")
    public ResponseEntity<ApiResponse<List<VocabularyProgressResponse>>> getDueReviews(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        List<VocabularyProgressResponse> responses = srsService.getDueReviews(user)
                .stream()
                .map(VocabularyProgressResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/review")
    public ResponseEntity<ApiResponse<Boolean>> submitReview(
            @RequestBody Map<String, Integer> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        Long progressId = Long.valueOf(payload.get("progressId"));
        int quality = payload.get("quality"); // 0-5
        
        srsService.submitReview(user, progressId, quality);
        return ResponseEntity.ok(ApiResponse.success(true));
    }
}
