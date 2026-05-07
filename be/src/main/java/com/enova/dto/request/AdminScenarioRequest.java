package com.enova.dto.request;

import lombok.Data;

@Data
public class AdminScenarioRequest {
    private String title;
    private String description;
    private String category;
    private String difficulty;
    private String aiPersonality;
    private String contextPrompt;
    private String tags;
    private Boolean isActive;
}
