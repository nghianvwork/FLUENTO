package com.enova.controller;

import com.enova.dto.request.CodeExecutionRequest;
import com.enova.dto.response.ApiResponse;
import com.enova.dto.response.CodeExecutionResponse;
import com.enova.model.User;
import com.enova.service.CodeCompilerService;
import com.enova.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compiler")
@RequiredArgsConstructor
public class CodeCompilerController {
    private final CodeCompilerService compilerService;
    private final UserService userService;

    @PostMapping("/execute")
    public ResponseEntity<ApiResponse<CodeExecutionResponse>> executeCode(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CodeExecutionRequest request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(compilerService.executeCode(user.getId(), request)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<CodeExecutionResponse>>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(compilerService.getUserExecutions(user.getId())));
    }
}
