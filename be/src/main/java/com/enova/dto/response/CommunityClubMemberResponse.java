package com.enova.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class CommunityClubMemberResponse {
    private Long id;
    private String fullName;
    private String avatarUrl;
    private String role;
}
