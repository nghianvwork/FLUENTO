package com.enova.service;

import com.enova.dto.response.ContentBookmarkResponse;
import com.enova.model.ContentBookmark;
import com.enova.model.ContentItem;
import com.enova.model.User;
import com.enova.repository.ContentBookmarkRepository;
import com.enova.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentBookmarkService {
    private final ContentBookmarkRepository bookmarkRepository;
    private final ContentService contentService;
    private final UserRepository userRepository;

    public List<ContentBookmarkResponse> getUserBookmarks(Long userId) {
        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public boolean isBookmarked(Long userId, Long contentId) {
        return bookmarkRepository.existsByUserIdAndContentId(userId, contentId);
    }

    @Transactional
    public ContentBookmarkResponse toggleBookmark(Long userId, Long contentId) {
        var existing = bookmarkRepository.findByUserIdAndContentId(userId, contentId);
        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
            return null;
        }

        ContentItem content = contentService.getContentById(contentId);
        User user = userRepository.findById(userId).orElseThrow();

        ContentBookmark bookmark = ContentBookmark.builder()
                .content(content)
                .user(user)
                .createdAt(LocalDateTime.now())
                .build();

        return toResponse(bookmarkRepository.save(bookmark));
    }

    private ContentBookmarkResponse toResponse(ContentBookmark bookmark) {
        return ContentBookmarkResponse.builder()
                .id(bookmark.getId())
                .content(bookmark.getContent())
                .createdAt(bookmark.getCreatedAt())
                .build();
    }
}
