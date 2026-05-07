package com.enova.repository;

import com.enova.model.ContentTestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentTestAttemptRepository extends JpaRepository<ContentTestAttempt, Long> {
    List<ContentTestAttempt> findByTestIdAndUserIdOrderByCreatedAtDesc(Long testId, Long userId);
    List<ContentTestAttempt> findByUserIdOrderByCreatedAtDesc(Long userId);
}
