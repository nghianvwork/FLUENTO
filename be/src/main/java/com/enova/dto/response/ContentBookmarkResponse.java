package com.enova.dto.response;

import com.enova.model.ContentItem;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ContentBookmarkResponse {
    private Long id;
    private ContentItem content;
    private LocalDateTime createdAt;
}
