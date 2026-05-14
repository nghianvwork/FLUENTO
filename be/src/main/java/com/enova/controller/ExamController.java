package com.enova.controller;

import com.enova.dto.response.ApiResponse;
import com.enova.model.Exam;
import com.enova.model.ExamAttempt;
import com.enova.model.User;
import com.enova.service.ExamService;
import com.enova.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {
    private final ExamService examService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Exam>>> getExams(@RequestParam(required = false) String type) {
        if (type != null) {
            return ResponseEntity.ok(ApiResponse.success(examService.getExamsByType(Exam.ExamType.valueOf(type.toUpperCase()))));
        }
        return ResponseEntity.ok(ApiResponse.success(examService.getAvailableExams()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Exam>> getExam(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(examService.getExam(id)));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<ExamAttempt>> submit(@AuthenticationPrincipal UserDetails userDetails,
                                                           @PathVariable Long id,
                                                           @RequestBody Map<String, Object> payload) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        Integer score = (Integer) payload.get("score");
        Integer total = (Integer) payload.get("total");
        Integer timeSpent = (Integer) payload.get("timeSpent");
        String answersJson = (String) payload.get("answersJson");

        return ResponseEntity.ok(ApiResponse.success(examService.submitAttempt(user, id, score, total, timeSpent, answersJson)));
    }

    @GetMapping("/attempts")
    public ResponseEntity<ApiResponse<List<ExamAttempt>>> getMyAttempts(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(examService.getUserAttempts(user.getId())));
    }

    @PostMapping("/seed")
    public ResponseEntity<ApiResponse<Exam>> seed(@RequestParam String type,
                                                  @RequestParam(required = false) String section,
                                                  @RequestParam(required = false) String level) {
        return ResponseEntity.ok(ApiResponse.success(examService.seedExam(type, section, level)));
    }
}
