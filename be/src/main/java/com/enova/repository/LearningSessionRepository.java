package com.enova.repository;

import com.enova.model.LearningSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LearningSessionRepository extends JpaRepository<LearningSession, Long> {
    List<LearningSession> findByUserIdOrderByCreatedAtDesc(Long userId);
}
