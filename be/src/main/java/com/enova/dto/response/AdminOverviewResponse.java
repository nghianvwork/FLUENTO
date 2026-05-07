package com.enova.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminOverviewResponse {
    private int activeUsers;
    private int newUsers;
    private int retentionRate;
    private long mrr;
    private int flaggedItems;
    private int pendingApprovals;
    private double uptimePercent;
    private int apiP95Ms;
    private long aiCostToday;
    private int processingQueue;
}
