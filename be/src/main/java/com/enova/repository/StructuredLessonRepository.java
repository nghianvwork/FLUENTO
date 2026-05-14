package com.enova.repository;

import com.enova.model.StructuredLesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StructuredLessonRepository extends JpaRepository<StructuredLesson, Long> {
    List<StructuredLesson> findByLevelCodeAndIsActiveTrueOrderByOrderIndexAsc(String levelCode);
    long countByLevelCodeAndIsActiveTrue(String levelCode);
}
