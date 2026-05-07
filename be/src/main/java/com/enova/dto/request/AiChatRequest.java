package com.enova.dto.request;

import lombok.Data;

@Data
public class AiChatRequest {
    private String message;
    private String context;
    private String tone;
}
