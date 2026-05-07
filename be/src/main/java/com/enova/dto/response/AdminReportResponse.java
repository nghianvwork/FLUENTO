package com.enova.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminReportResponse {
    private Long id;
    private String title;
    private String period;
    private String status;
    private String generatedAt;
}
