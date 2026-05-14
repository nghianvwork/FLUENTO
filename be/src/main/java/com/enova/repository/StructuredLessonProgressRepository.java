package com.enova.repository;

import com.enova.model.StructuredLessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StructuredLessonProgressRepository extends JpaRepository<StructuredLessonProgress, Long> {
    Optional<StructuredLessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);
    List<StructuredLessonProgress> findByUserIdAndLesson_LevelCode(Long userId, String levelCode);
    long countByUserIdAndLesson_LevelCodeAndStatus(Long userId, String levelCode, StructuredLessonProgress.ProgressStatus status);
}
