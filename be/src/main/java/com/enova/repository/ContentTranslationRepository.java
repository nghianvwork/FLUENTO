package com.enova.repository;

import com.enova.model.ContentTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentTranslationRepository extends JpaRepository<ContentTranslation, Long> {
    List<ContentTranslation> findByContentIdAndUserIdOrderByCreatedAtDesc(Long contentId, Long userId);
    List<ContentTranslation> findByUserIdOrderByCreatedAtDesc(Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
}
