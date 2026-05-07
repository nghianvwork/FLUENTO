package com.enova.controller;

import com.enova.dto.response.ApiResponse;
import com.enova.model.Scenario;
import com.enova.model.CareerPath;
import com.enova.service.RoleplayService;
import com.enova.service.CareerEngineService;
import com.enova.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {
    private final RoleplayService roleplayService;
    private final CareerEngineService careerEngineService;

    @GetMapping("/scenarios/preview")
    public ResponseEntity<ApiResponse<List<Scenario>>> previewScenarios() {
        List<Scenario> all = roleplayService.getActiveScenarios();
        return ResponseEntity.ok(ApiResponse.success(all.subList(0, Math.min(5, all.size()))));
    }

    @GetMapping("/careers/preview")
    public ResponseEntity<ApiResponse<List<CareerPath>>> previewCareers() {
        return ResponseEntity.ok(ApiResponse.success(careerEngineService.getAllCareerPaths()));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalScenarios", 200);
        stats.put("totalCareers", 15);
        stats.put("totalUsers", 10000);
        stats.put("activeRooms", 25);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
