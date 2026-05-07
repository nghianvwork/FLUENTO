package com.enova.controller;

import com.enova.dto.response.ApiResponse;
import com.enova.model.ContentItem;
import com.enova.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class ContentController {
    private final ContentService contentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ContentItem>>> getAllContent(
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String type) {
        List<ContentItem> items;
        if (topic != null) items = contentService.getContentByTopic(topic);
        else if (type != null) items = contentService.getContentByType(ContentItem.SourceType.valueOf(type));
        else items = contentService.getAllActiveContent();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContentItem>> getContent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(contentService.getContentById(id)));
    }
}
