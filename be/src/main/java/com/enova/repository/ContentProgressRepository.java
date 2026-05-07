package com.enova.repository;

import com.enova.model.ContentProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContentProgressRepository extends JpaRepository<ContentProgress, Long> {
    Optional<ContentProgress> findByUserIdAndContentId(Long userId, Long contentId);
    List<ContentProgress> findByUserId(Long userId);
}
