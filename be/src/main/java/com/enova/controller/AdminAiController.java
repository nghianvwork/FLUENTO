package com.enova.controller;

import com.enova.dto.request.AdminAiInsightRequest;
import com.enova.dto.response.AdminOverviewResponse;
import com.enova.dto.response.ApiResponse;
import com.enova.service.AdminOpsService;
import com.enova.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/ai")
@RequiredArgsConstructor
public class AdminAiController {

    private final AdminOpsService adminOpsService;
    private final GeminiService geminiService;

    @PostMapping("/insights")
    public ResponseEntity<ApiResponse<Map<String, String>>> insights(@RequestBody(required = false) AdminAiInsightRequest request) {
        AdminOverviewResponse overview = adminOpsService.getOverview();
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("activeUsers", overview.getActiveUsers());
        metrics.put("newUsers", overview.getNewUsers());
        metrics.put("retentionRate", overview.getRetentionRate());
        metrics.put("mrr", overview.getMrr());
        metrics.put("flaggedItems", overview.getFlaggedItems());
        metrics.put("pendingApprovals", overview.getPendingApprovals());
        metrics.put("apiP95Ms", overview.getApiP95Ms());
        metrics.put("aiCostToday", overview.getAiCostToday());
        metrics.put("processingQueue", overview.getProcessingQueue());

        String reply = geminiService.generateAdminInsights(request != null ? request.getFocus() : null, metrics)
                .orElse("AI insights unavailable. Please try again later.");
        return ResponseEntity.ok(ApiResponse.success(Map.of("insights", reply)));
    }
}
