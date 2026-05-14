package com.enova.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StructuredLevelResponse {
    private String code;
    private String title;
    private String description;
    private Integer orderIndex;
    private Long totalLessons;
    private Long completedLessons;
}
