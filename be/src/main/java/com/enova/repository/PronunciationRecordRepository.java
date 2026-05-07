package com.enova.repository;

import com.enova.model.PronunciationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PronunciationRecordRepository extends JpaRepository<PronunciationRecord, Long> {
    List<PronunciationRecord> findByUserIdOrderByCreatedAtDesc(Long userId);
}
