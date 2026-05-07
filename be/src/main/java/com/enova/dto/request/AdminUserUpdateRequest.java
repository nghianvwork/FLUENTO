package com.enova.dto.request;

import lombok.Data;

@Data
public class AdminUserUpdateRequest {
    private String fullName;
    private String email;
    private String password;
    private String role;
    private String status;
    private String avatarUrl;
}
