package com.enova.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminTicketResponse {
    private Long id;
    private String type;
    private String priority;
    private String subject;
    private String status;
    private String reporter;
    private String createdAt;
}
