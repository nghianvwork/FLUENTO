package com.enova.dto.request;

import lombok.Data;

@Data
public class RoleplayMessageRequest {
    private Long sessionId;
    private Long scenarioId;
    private String userMessage;
}
