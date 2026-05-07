package com.enova.repository;

import com.enova.model.ContentQuiz;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContentQuizRepository extends JpaRepository<ContentQuiz, Long> {
    List<ContentQuiz> findByContentIdAndIsActiveTrueOrderByCreatedAtAsc(Long contentId);
    List<ContentQuiz> findByContentId(Long contentId);
}
