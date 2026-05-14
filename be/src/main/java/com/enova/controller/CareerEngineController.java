package com.enova.controller;

import com.enova.dto.response.ApiResponse;
import com.enova.model.*;
import com.enova.service.CareerEngineService;
import com.enova.service.FreeDictionaryService;
import com.enova.service.UserService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/career")
@RequiredArgsConstructor
public class CareerEngineController {
    private final CareerEngineService careerEngineService;
    private final UserService userService;
    private final FreeDictionaryService freeDictionaryService;

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
    public ResponseEntity<ApiResponse<List<Vocabulary>>> getVocabulary(
            @PathVariable Long id,
            @RequestParam(required = false) String partOfSpeech) {
        return ResponseEntity.ok(ApiResponse.success(careerEngineService.getVocabularyByPartOfSpeech(id, partOfSpeech)));
    }

    @PostMapping("/paths/{id}/seed")
    public ResponseEntity<ApiResponse<String>> seedVocabulary(@PathVariable Long id) {
        careerEngineService.seedVocabulariesForPathAsync(id);
        return ResponseEntity.ok(ApiResponse.success("Seeding started in background for 500 words."));
    }

    @PostMapping("/paths/{id}/seed-lessons")
    public ResponseEntity<ApiResponse<String>> seedLessons(@PathVariable Long id) {
        careerEngineService.seedLessonsForPathAsync(id);
        return ResponseEntity.ok(ApiResponse.success("Lesson seeding started in background."));
    }

    @PostMapping("/paths/{id}/seed-dictionary")
    public ResponseEntity<ApiResponse<String>> seedDictionary(@PathVariable Long id) {
        careerEngineService.seedFromDictionaryAsync(id);
        return ResponseEntity.ok(ApiResponse.success("Dictionary seeding started. Words will be enriched with phonetics, audio, synonyms & antonyms from Free Dictionary API."));
    }

    @GetMapping("/dictionary/lookup")
    public ResponseEntity<ApiResponse<Object>> lookupWord(@RequestParam String word) {
        Optional<JsonNode> result = freeDictionaryService.lookupWordFull(word.trim());
        if (result.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(Map.of("found", false, "word", word)));
        }
        return ResponseEntity.ok(ApiResponse.success(result.get()));
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
