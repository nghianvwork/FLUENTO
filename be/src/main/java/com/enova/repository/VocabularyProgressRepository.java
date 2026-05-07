package com.enova.repository;

import com.enova.model.VocabularyProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

import java.time.LocalDateTime;

public interface VocabularyProgressRepository extends JpaRepository<VocabularyProgress, Long> {
    List<VocabularyProgress> findByUserId(Long userId);
    Optional<VocabularyProgress> findByUserIdAndVocabularyId(Long userId, Long vocabularyId);
    long countByUserIdAndMasteryLevelGreaterThan(Long userId, int level);
    List<VocabularyProgress> findByUserIdAndNextReviewAtLessThanEqualOrderByNextReviewAtAsc(Long userId, LocalDateTime now);
}
