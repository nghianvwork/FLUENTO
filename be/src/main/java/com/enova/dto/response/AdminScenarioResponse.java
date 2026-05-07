package com.enova.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminScenarioResponse {
    private Long id;
    private String title;
    private String category;
    private String difficulty;
    private String status;
    private int usageCount;
    private double rating;
}
