package com.enova.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MediaUploadResponse {
    private String url;
    private String filename;
    private String contentType;
    private long sizeBytes;
}
