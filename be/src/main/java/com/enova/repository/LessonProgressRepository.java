package com.enova.repository;

import com.enova.model.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    List<LessonProgress> findByUserId(Long userId);
    Optional<LessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);
    long countByUserIdAndStatus(Long userId, LessonProgress.ProgressStatus status);
}
