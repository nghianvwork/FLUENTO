package com.enova.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class CommunityClubDetailResponse {
    private Long id;
    private String name;
    private String focus;
    private String level;
    private long members;
    private boolean joined;
}
