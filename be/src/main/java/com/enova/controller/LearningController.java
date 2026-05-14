package com.enova.controller;

import com.enova.dto.response.ApiResponse;
import com.enova.model.JournalEntry;
import com.enova.model.StudyPlanBlock;
import com.enova.model.User;
import com.enova.service.LearningService;
import com.enova.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning")
@RequiredArgsConstructor
public class LearningController {
    private final LearningService learningService;
    private final UserService userService;

    // Journal
    @GetMapping("/journal")
    public ResponseEntity<ApiResponse<List<JournalEntry>>> getJournal(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(learningService.getJournalEntries(user.getId())));
    }

    @PostMapping("/journal")
    public ResponseEntity<ApiResponse<JournalEntry>> addJournalEntry(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody JournalEntry entry) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(learningService.createJournalEntry(user.getId(), entry)));
    }

    @DeleteMapping("/journal/{id}")
    public ResponseEntity<ApiResponse<String>> deleteJournalEntry(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        learningService.deleteJournalEntry(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Entry deleted"));
    }

    // Planner
    @GetMapping("/planner")
    public ResponseEntity<ApiResponse<List<StudyPlanBlock>>> getPlanner(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(learningService.getStudyPlan(user.getId())));
    }

    @PostMapping("/planner")
    public ResponseEntity<ApiResponse<StudyPlanBlock>> addPlanBlock(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody StudyPlanBlock block) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(learningService.addPlanBlock(user.getId(), block)));
    }

    @PostMapping("/planner/{id}/toggle")
    public ResponseEntity<ApiResponse<StudyPlanBlock>> toggleBlock(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(learningService.toggleBlockCompletion(user.getId(), id)));
    }

    @DeleteMapping("/planner/{id}")
    public ResponseEntity<ApiResponse<String>> deleteBlock(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        learningService.deletePlanBlock(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Block deleted"));
    }
}
