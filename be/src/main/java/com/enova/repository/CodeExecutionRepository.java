package com.enova.repository;

import com.enova.model.CodeExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeExecutionRepository extends JpaRepository<CodeExecution, Long> {
    List<CodeExecution> findByUserIdOrderByCreatedAtDesc(Long userId);
}
