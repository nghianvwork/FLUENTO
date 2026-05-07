package com.enova.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class CommunityEventResponse {
    private Long id;
    private String title;
    private String timeLabel;
    private String host;
    private int reserved;
    private int capacity;
    private boolean reservedByUser;
}
