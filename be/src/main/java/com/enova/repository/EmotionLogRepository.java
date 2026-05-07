package com.enova.repository;

import com.enova.model.EmotionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmotionLogRepository extends JpaRepository<EmotionLog, Long> {
    List<EmotionLog> findByUserIdOrderByTimestampDesc(Long userId);
    List<EmotionLog> findBySessionId(Long sessionId);
}
