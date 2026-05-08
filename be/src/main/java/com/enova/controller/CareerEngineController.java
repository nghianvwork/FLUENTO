package com.enova.controller;

import com.enova.dto.response.ApiResponse;
import com.enova.model.*;
import com.enova.service.CareerEngineService;
import com.enova.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/career")
@RequiredArgsConstructor
public class CareerEngineController {
    private final CareerEngineService careerEngineService;
    private final UserService userService;

    @GetMapping("/paths")
    public ResponseEntity<ApiResponse<List<CareerPath>>> getAllPaths() {
        return ResponseEntity.ok(ApiResponse.success(careerEngineService.getAllCareerPaths()));
    }

    @GetMapping("/paths/{id}")
    public ResponseEntity<ApiResponse<CareerPath>> getPath(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(careerEngineService.getCareerPathById(id)));
    }

    @GetMapping("/paths/{id}/lessons")
    public ResponseEntity<ApiResponse<List<Lesson>>> getLessons(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(careerEngineService.getLessonsByCareerPath(id)));
    }

    @GetMapping("/paths/{id}/vocabulary")
    public ResponseEntity<ApiResponse<List<Vocabulary>>> getVocabulary(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(careerEngineService.getVocabularyByCareerPath(id)));
    }

    @PostMapping("/paths/{id}/seed")
    public ResponseEntity<ApiResponse<String>> seedVocabulary(@PathVariable Long id) {
        careerEngineService.seedVocabulariesForPathAsync(id);
        return ResponseEntity.ok(ApiResponse.success("Seeding started in background for 500 words."));
    }

    @PostMapping("/lessons/{lessonId}/start")
    public ResponseEntity<ApiResponse<LessonProgress>> startLesson(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long lessonId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(careerEngineService.startLesson(user.getId(), lessonId)));
    }

    @PostMapping("/lessons/{lessonId}/complete")
    public ResponseEntity<ApiResponse<LessonProgress>> completeLesson(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long lessonId,
            @RequestBody Map<String, Integer> request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(careerEngineService.completeLesson(user.getId(), lessonId, request.get("score"))));
    }

    @PostMapping("/vocabulary/{vocabId}/review")
    public ResponseEntity<ApiResponse<VocabularyProgress>> reviewVocab(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long vocabId,
            @RequestBody Map<String, Boolean> request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(careerEngineService.reviewVocabulary(user.getId(), vocabId, request.get("correct"))));
    }

    @GetMapping("/progress")
    public ResponseEntity<ApiResponse<List<LessonProgress>>> getProgress(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(careerEngineService.getUserLessonProgress(user.getId())));
    }
}
