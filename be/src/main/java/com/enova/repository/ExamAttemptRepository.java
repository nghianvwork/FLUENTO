package com.enova.repository;

import com.enova.model.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    List<ExamAttempt> findByUserIdOrderByCompletedAtDesc(Long userId);
    List<ExamAttempt> findByUserIdAndExamIdOrderByCompletedAtDesc(Long userId, Long examId);
}
