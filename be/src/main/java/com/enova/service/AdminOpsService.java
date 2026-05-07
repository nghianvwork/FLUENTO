package com.enova.service;

import com.enova.dto.request.AdminSettingsRequest;
import com.enova.dto.response.AdminOverviewResponse;
import com.enova.dto.response.AdminReportResponse;
import com.enova.dto.response.AdminSettingsResponse;
import com.enova.dto.response.AdminTicketResponse;
import com.enova.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

@Service
@RequiredArgsConstructor
public class AdminOpsService {

    private final UserRepository userRepository;
    private final AtomicReference<AdminSettingsResponse> settings = new AtomicReference<>(
            AdminSettingsResponse.builder()
                    .featureCoachV2(true)
                    .featureLiveTranscripts(true)
                    .featureRoleplayBoost(false)
                    .antiAbuseMode(true)
                    .maxDailyRoleplay(30)
                    .maxRoomParticipants(12)
                    .aiCostCap(2_500_000)
                    .maintenanceMode(false)
                    .build()
    );

    public AdminOverviewResponse getOverview() {
        int totalUsers = (int) userRepository.count();
        return AdminOverviewResponse.builder()
                .activeUsers(Math.max(totalUsers, 1))
                .newUsers(Math.min(totalUsers, 120))
                .retentionRate(71)
                .mrr(124_300_000)
                .flaggedItems(9)
                .pendingApprovals(12)
                .uptimePercent(99.97)
                .apiP95Ms(320)
                .aiCostToday(1_850_000)
                .processingQueue(34)
                .build();
    }

    public List<AdminReportResponse> getReports() {
        return List.of(
                AdminReportResponse.builder()
                        .id(1L)
                        .title("Weekly Growth Snapshot")
                        .period("Apr 28 - May 4")
                        .status("READY")
                        .generatedAt("1h ago")
                        .build(),
                AdminReportResponse.builder()
                        .id(2L)
                        .title("AI Coach Quality Review")
                        .period("Apr 21 - Apr 27")
                        .status("READY")
                        .generatedAt("3d ago")
                        .build(),
                AdminReportResponse.builder()
                        .id(3L)
                        .title("Retention Cohort Report")
                        .period("Apr 1 - Apr 30")
                        .status("GENERATING")
                        .generatedAt("Just now")
                        .build()
        );
    }

    public List<AdminTicketResponse> getTickets() {
        return List.of(
                AdminTicketResponse.builder()
                        .id(1L)
                        .type("CONTENT")
                        .priority("HIGH")
                        .subject("Inappropriate language in roleplay")
                        .status("OPEN")
                        .reporter("ai-guard")
                        .createdAt("12m ago")
                        .build(),
                AdminTicketResponse.builder()
                        .id(2L)
                        .type("USER")
                        .priority("MEDIUM")
                        .subject("Spam invitations in speaking rooms")
                        .status("INVESTIGATING")
                        .reporter("community")
                        .createdAt("2h ago")
                        .build(),
                AdminTicketResponse.builder()
                        .id(3L)
                        .type("BUG")
                        .priority("LOW")
                        .subject("Audio latency in room 204")
                        .status("OPEN")
                        .reporter("coach-team")
                        .createdAt("1d ago")
                        .build()
        );
    }

    public AdminSettingsResponse getSettings() {
        return settings.get();
    }

    public AdminSettingsResponse updateSettings(AdminSettingsRequest request) {
        AdminSettingsResponse current = settings.get();
        AdminSettingsResponse updated = AdminSettingsResponse.builder()
                .featureCoachV2(request.getFeatureCoachV2() != null ? request.getFeatureCoachV2() : current.getFeatureCoachV2())
                .featureLiveTranscripts(request.getFeatureLiveTranscripts() != null ? request.getFeatureLiveTranscripts() : current.getFeatureLiveTranscripts())
                .featureRoleplayBoost(request.getFeatureRoleplayBoost() != null ? request.getFeatureRoleplayBoost() : current.getFeatureRoleplayBoost())
                .antiAbuseMode(request.getAntiAbuseMode() != null ? request.getAntiAbuseMode() : current.getAntiAbuseMode())
                .maxDailyRoleplay(request.getMaxDailyRoleplay() != null ? request.getMaxDailyRoleplay() : current.getMaxDailyRoleplay())
                .maxRoomParticipants(request.getMaxRoomParticipants() != null ? request.getMaxRoomParticipants() : current.getMaxRoomParticipants())
                .aiCostCap(request.getAiCostCap() != null ? request.getAiCostCap() : current.getAiCostCap())
                .maintenanceMode(request.getMaintenanceMode() != null ? request.getMaintenanceMode() : current.getMaintenanceMode())
                .build();

        settings.set(updated);
        return updated;
    }
}
