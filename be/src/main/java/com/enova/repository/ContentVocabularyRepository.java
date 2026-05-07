package com.enova.repository;

import com.enova.model.ContentVocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ContentVocabularyRepository extends JpaRepository<ContentVocabulary, Long> {
    List<ContentVocabulary> findByUserIdAndContentIdOrderByCreatedAtDesc(Long userId, Long contentId);
    List<ContentVocabulary> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<ContentVocabulary> findByUserIdAndContentIdAndWord(Long userId, Long contentId, String word);
}
