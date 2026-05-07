package com.enova.repository;

import com.enova.model.ContentNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContentNoteRepository extends JpaRepository<ContentNote, Long> {
    List<ContentNote> findByUserIdAndContentIdOrderByTimestampSecondsAsc(Long userId, Long contentId);
    List<ContentNote> findByUserIdOrderByCreatedAtDesc(Long userId);
}
