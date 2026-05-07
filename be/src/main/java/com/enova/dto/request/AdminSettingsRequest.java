package com.enova.dto.request;

import lombok.Data;

@Data
public class AdminSettingsRequest {
    private Boolean featureCoachV2;
    private Boolean featureLiveTranscripts;
    private Boolean featureRoleplayBoost;
    private Boolean antiAbuseMode;
    private Integer maxDailyRoleplay;
    private Integer maxRoomParticipants;
    private Integer aiCostCap;
    private Boolean maintenanceMode;
}
