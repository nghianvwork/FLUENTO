package com.enova.repository;

import com.enova.model.ContentItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContentItemRepository extends JpaRepository<ContentItem, Long> {
    List<ContentItem> findByIsActiveTrueOrderByCreatedAtDesc();
    List<ContentItem> findByTopicAndIsActiveTrue(String topic);
    List<ContentItem> findBySourceTypeAndIsActiveTrue(ContentItem.SourceType sourceType);
}
