package com.enova.controller;

import com.enova.dto.request.ContentAiSummaryRequest;
import com.enova.dto.response.ApiResponse;
import com.enova.dto.response.ContentAiSummaryResponse;
import com.enova.service.ContentAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/content/ai")
@RequiredArgsConstructor
public class ContentAiController {

    private final ContentAiService contentAiService;

    @PostMapping("/summary")
    public ResponseEntity<ApiResponse<ContentAiSummaryResponse>> summary(@RequestBody ContentAiSummaryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                contentAiService.summarize(request.getContentId(), request.getFocus())));
    }

    @PostMapping("/generate-quiz")
    public ResponseEntity<ApiResponse<String>> generateQuiz(@RequestBody Map<String, Long> request) {
        Long contentId = request.get("contentId");
        contentAiService.generateQuizzes(contentId);
        return ResponseEntity.ok(ApiResponse.success("Quiz generation started"));
    }
}
