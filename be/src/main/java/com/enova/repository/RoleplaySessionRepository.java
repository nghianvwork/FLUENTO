package com.enova.repository;

import com.enova.model.RoleplaySession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoleplaySessionRepository extends JpaRepository<RoleplaySession, Long> {
    List<RoleplaySession> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
}
