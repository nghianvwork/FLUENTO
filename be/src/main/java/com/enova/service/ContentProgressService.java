package com.enova.service;

import com.enova.dto.response.ContentProgressResponse;
import com.enova.exception.ResourceNotFoundException;
import com.enova.model.ContentItem;
import com.enova.model.ContentProgress;
import com.enova.model.User;
import com.enova.repository.ContentProgressRepository;
import com.enova.repository.UserProfileRepository;
import com.enova.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentProgressService {
    private final ContentService contentService;
    private final ContentProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;

    public List<ContentProgressResponse> getProgress(Long userId) {
        return progressRepository.findByUserId(userId).stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ContentProgressResponse startContent(Long contentId, Long userId) {
        ContentItem item = contentService.getContentById(contentId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ContentProgress progress = progressRepository.findByUserIdAndContentId(userId, contentId)
                .orElse(null);

        if (progress == null) {
            progress = ContentProgress.builder()
                    .content(item)
                    .user(user)
                    .status(ContentProgress.ProgressStatus.IN_PROGRESS)
                    .startedAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
        } else if (progress.getStatus() != ContentProgress.ProgressStatus.COMPLETED) {
            if (progress.getStartedAt() == null) progress.setStartedAt(LocalDateTime.now());
            progress.setStatus(ContentProgress.ProgressStatus.IN_PROGRESS);
            progress.setUpdatedAt(LocalDateTime.now());
        } else {
            progress.setUpdatedAt(LocalDateTime.now());
        }

        progressRepository.save(progress);
        touchLastStudyDate(user.getId());
        return buildResponse(progress);
    }

    @Transactional
    public ContentProgressResponse completeContent(Long contentId, Long userId) {
        ContentItem item = contentService.getContentById(contentId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ContentProgress progress = progressRepository.findByUserIdAndContentId(userId, contentId)
                .orElse(null);

        if (progress == null) {
            progress = ContentProgress.builder()
                    .content(item)
                    .user(user)
                    .status(ContentProgress.ProgressStatus.COMPLETED)
                    .startedAt(LocalDateTime.now())
                    .completedAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
        } else {
            if (progress.getStartedAt() == null) progress.setStartedAt(LocalDateTime.now());
            progress.setStatus(ContentProgress.ProgressStatus.COMPLETED);
            progress.setCompletedAt(LocalDateTime.now());
            progress.setUpdatedAt(LocalDateTime.now());
        }

        progressRepository.save(progress);
        touchLastStudyDate(user.getId());
        return buildResponse(progress);
    }

    private void touchLastStudyDate(Long userId) {
        profileRepository.findByUserId(userId).ifPresent(profile -> {
            profile.setLastStudyDate(LocalDateTime.now());
            profileRepository.save(profile);
        });
    }

    private ContentProgressResponse buildResponse(ContentProgress progress) {
        return ContentProgressResponse.builder()
                .contentId(progress.getContent().getId())
                .status(progress.getStatus().name())
                .startedAt(progress.getStartedAt())
                .completedAt(progress.getCompletedAt())
                .build();
    }
}
