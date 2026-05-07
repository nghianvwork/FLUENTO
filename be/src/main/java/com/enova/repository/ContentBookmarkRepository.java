package com.enova.repository;

import com.enova.model.ContentBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ContentBookmarkRepository extends JpaRepository<ContentBookmark, Long> {
    List<ContentBookmark> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<ContentBookmark> findByUserIdAndContentId(Long userId, Long contentId);
    boolean existsByUserIdAndContentId(Long userId, Long contentId);
}
