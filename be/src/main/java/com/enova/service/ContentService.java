package com.enova.service;

import com.enova.model.ContentItem;
import com.enova.repository.ContentItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContentService {
    private final ContentItemRepository contentItemRepository;

    public List<ContentItem> getAllActiveContent() {
        return contentItemRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    public List<ContentItem> getContentByTopic(String topic) {
        return contentItemRepository.findByTopicAndIsActiveTrue(topic);
    }

    public List<ContentItem> getContentByType(ContentItem.SourceType type) {
        return contentItemRepository.findBySourceTypeAndIsActiveTrue(type);
    }

    public ContentItem getContentById(Long id) {
        return contentItemRepository.findById(id).orElseThrow(() -> new RuntimeException("Content not found"));
    }

    public List<ContentItem> getAllContent() {
        return contentItemRepository.findAll();
    }

    public ContentItem createContent(ContentItem item) {
        return contentItemRepository.save(item);
    }

    public ContentItem updateContent(Long id, ContentItem update) {
        ContentItem item = getContentById(id);

        if (update.getTitle() != null) item.setTitle(update.getTitle());
        if (update.getSourceUrl() != null) item.setSourceUrl(update.getSourceUrl());
        if (update.getSourceType() != null) item.setSourceType(update.getSourceType());
        if (update.getThumbnailUrl() != null) item.setThumbnailUrl(update.getThumbnailUrl());
        if (update.getDurationSeconds() != null) item.setDurationSeconds(update.getDurationSeconds());
        if (update.getDifficulty() != null) item.setDifficulty(update.getDifficulty());
        if (update.getTopic() != null) item.setTopic(update.getTopic());
        if (update.getTranscript() != null) item.setTranscript(update.getTranscript());
        if (update.getSummary() != null) item.setSummary(update.getSummary());
        if (update.getTags() != null) item.setTags(update.getTags());
        if (update.getIsActive() != null) item.setIsActive(update.getIsActive());

        return contentItemRepository.save(item);
    }

    public void deleteContent(Long id) {
        contentItemRepository.deleteById(id);
    }
}
