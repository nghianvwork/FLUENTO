package com.enova.repository;

import com.enova.model.ContentQuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ContentQuizAttemptRepository extends JpaRepository<ContentQuizAttempt, Long> {
    List<ContentQuizAttempt> findByUserIdAndQuizId(Long userId, Long quizId);
    
    @Query("SELECT ca FROM ContentQuizAttempt ca WHERE ca.user.id = :userId AND ca.quiz.content.id = :contentId")
    List<ContentQuizAttempt> findByUserIdAndContentId(Long userId, Long contentId);
}
