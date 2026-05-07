package com.enova.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminSettingsResponse {
    private Boolean featureCoachV2;
    private Boolean featureLiveTranscripts;
    private Boolean featureRoleplayBoost;
    private Boolean antiAbuseMode;
    private Integer maxDailyRoleplay;
    private Integer maxRoomParticipants;
    private Integer aiCostCap;
    private Boolean maintenanceMode;
}
