package com.enova.controller;

import com.enova.dto.request.AiChatRequest;
import com.enova.dto.request.AiEmotionRequest;
import com.enova.dto.response.ApiResponse;
import com.enova.dto.response.AiEmotionResponse;
import com.enova.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<Map<String, String>>> chat(@RequestBody AiChatRequest request) {
        String message = request.getMessage() == null ? "" : request.getMessage();
        String reply = geminiService.generateChatResponse(message, request.getContext(), request.getTone())
                .orElse("AI is unavailable. Please try again.");
        return ResponseEntity.ok(ApiResponse.success(Map.of("reply", reply)));
    }

    @PostMapping("/emotion")
    public ResponseEntity<ApiResponse<AiEmotionResponse>> emotion(@RequestBody AiEmotionRequest request) {
        String text = request.getText() == null ? "" : request.getText();
        var json = geminiService.generateEmotionAnalysis(text, request.getContext()).orElse(null);
        AiEmotionResponse response = AiEmotionResponse.builder()
                .emotion(json != null ? json.path("emotion").asText("neutral") : "neutral")
                .confidence(json != null ? json.path("confidence").asText("medium") : "medium")
                .coachingTone(json != null ? json.path("coachingTone").asText("supportive") : "supportive")
                .suggestion(json != null ? json.path("suggestion").asText("Keep going and stay consistent.") : "Keep going and stay consistent.")
                .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
