package com.enova.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class CommunityMatchResponse {
    private Long memberId;
    private String memberName;
    private String memberAvatarUrl;
    private String memberRole;
    private Long clubId;
    private String clubName;
}
