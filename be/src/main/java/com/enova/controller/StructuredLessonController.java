package com.enova.controller;

import com.enova.dto.request.StructuredLessonCompleteRequest;
import com.enova.dto.response.ApiResponse;
import com.enova.dto.response.StructuredLevelResponse;
import com.enova.dto.response.StructuredLessonProgressResponse;
import com.enova.dto.response.StructuredLessonResponse;
import com.enova.model.User;
import com.enova.service.StructuredLessonService;
import com.enova.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/structured")
@RequiredArgsConstructor
public class StructuredLessonController {

    private final StructuredLessonService lessonService;
    private final UserService userService;

    @GetMapping("/levels")
    public ResponseEntity<ApiResponse<List<StructuredLevelResponse>>> getLevels(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(lessonService.getLevels(user.getId())));
    }

    @GetMapping("/levels/{levelCode}/lessons")
    public ResponseEntity<ApiResponse<List<StructuredLessonResponse>>> getLessons(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String levelCode) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(lessonService.getLessonsByLevel(levelCode, user.getId())));
    }

    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<ApiResponse<StructuredLessonResponse>> getLessonDetail(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long lessonId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(lessonService.getLessonDetail(lessonId, user.getId())));
    }

    @PostMapping("/lessons/{lessonId}/start")
    public ResponseEntity<ApiResponse<StructuredLessonProgressResponse>> startLesson(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long lessonId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(lessonService.startLesson(lessonId, user)));
    }

    @PostMapping("/lessons/{lessonId}/complete")
    public ResponseEntity<ApiResponse<StructuredLessonProgressResponse>> completeLesson(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long lessonId,
            @RequestBody StructuredLessonCompleteRequest request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(lessonService.completeLesson(lessonId, user, request)));
    }

    @PostMapping("/levels/{levelCode}/seed")
    public ResponseEntity<ApiResponse<String>> seedLevel(@PathVariable String levelCode) {
        lessonService.seedLessonsForLevel(levelCode);
        return ResponseEntity.ok(ApiResponse.success("Lesson seeding started"));
    }
}
