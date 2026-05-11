package com.enova.service;

import com.enova.model.ContentItem;
import com.enova.model.ContentProgress;
import com.enova.model.Scenario;
import com.enova.model.UserProfile;
import com.enova.repository.ContentItemRepository;
import com.enova.repository.ContentProgressRepository;
import com.enova.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ContentService {
    private final ContentItemRepository contentItemRepository;
    private final ContentProgressRepository contentProgressRepository;
    private final UserProfileRepository userProfileRepository;

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

    public List<ContentItem> getRecommendedContent(Long userId, int limit) {
        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
        Scenario.Difficulty difficulty = mapDifficulty(profile != null ? profile.getCefrLevel() : null);
        String topic = profile != null ? profile.getCareerIndustry() : null;

        Set<Long> completedContent = getCompletedContentIds(userId);
        List<ContentItem> recommended = new ArrayList<>();

        if (topic != null && !topic.isBlank()) {
            recommended.addAll(filterCompleted(
                    contentItemRepository.findByIsActiveTrueAndTopicIgnoreCaseAndDifficultyOrderByCreatedAtDesc(
                            topic, difficulty),
                    completedContent
            ));
        }

        if (recommended.size() < limit) {
            recommended.addAll(filterCompleted(
                    contentItemRepository.findByIsActiveTrueAndDifficultyOrderByCreatedAtDesc(difficulty),
                    completedContent
            ));
        }

        if (recommended.size() < limit && topic != null && !topic.isBlank()) {
            recommended.addAll(filterCompleted(
                    contentItemRepository.findByIsActiveTrueAndTopicIgnoreCaseOrderByCreatedAtDesc(topic),
                    completedContent
            ));
        }

        if (recommended.size() < limit) {
            recommended.addAll(filterCompleted(
                    contentItemRepository.findByIsActiveTrueOrderByCreatedAtDesc(),
                    completedContent
            ));
        }

        if (recommended.size() > limit) {
            return recommended.subList(0, limit);
        }
        return recommended;
    }

    private Set<Long> getCompletedContentIds(Long userId) {
        Set<Long> completed = new HashSet<>();
        List<ContentProgress> progressList = contentProgressRepository.findByUserId(userId);
        for (ContentProgress progress : progressList) {
            if (progress.getStatus() == ContentProgress.ProgressStatus.COMPLETED) {
                completed.add(progress.getContent().getId());
            }
        }
        return completed;
    }

    private List<ContentItem> filterCompleted(List<ContentItem> items, Set<Long> completed) {
        List<ContentItem> filtered = new ArrayList<>();
        for (ContentItem item : items) {
            if (!completed.contains(item.getId()) && !filtered.contains(item)) {
                filtered.add(item);
            }
        }
        return filtered;
    }

    private Scenario.Difficulty mapDifficulty(UserProfile.CefrLevel level) {
        if (level == null) {
            return Scenario.Difficulty.INTERMEDIATE;
        }
        switch (level) {
            case A1:
            case A2:
                return Scenario.Difficulty.BEGINNER;
            case B1:
            case B2:
                return Scenario.Difficulty.INTERMEDIATE;
            case C1:
            case C2:
                return Scenario.Difficulty.ADVANCED;
            default:
                return Scenario.Difficulty.INTERMEDIATE;
        }
    }
}
