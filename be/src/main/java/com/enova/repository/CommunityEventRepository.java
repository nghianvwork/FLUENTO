package com.enova.repository;

import com.enova.model.CommunityEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityEventRepository extends JpaRepository<CommunityEvent, Long> {
}
