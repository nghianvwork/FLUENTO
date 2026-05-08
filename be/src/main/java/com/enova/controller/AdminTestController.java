package com.enova.controller;

import com.enova.dto.request.AdminTestRequest;
import com.enova.dto.response.ApiResponse;
import com.enova.dto.response.ContentTestResponse;
import com.enova.service.ContentTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tests")
@RequiredArgsConstructor
public class AdminTestController {
    private final ContentTestService testService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ContentTestResponse>>> getAllTests() {
        return ResponseEntity.ok(ApiResponse.success(testService.getAllTests()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContentTestResponse>> getTestById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(testService.getTestById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ContentTestResponse>> createTest(@RequestBody AdminTestRequest request) {
        return ResponseEntity.ok(ApiResponse.success(testService.createTest(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ContentTestResponse>> updateTest(
            @PathVariable Long id, @RequestBody AdminTestRequest request) {
        return ResponseEntity.ok(ApiResponse.success(testService.updateTest(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteTest(@PathVariable Long id) {
        testService.deleteTest(id);
        return ResponseEntity.ok(ApiResponse.success("Test deleted successfully"));
    }
}
