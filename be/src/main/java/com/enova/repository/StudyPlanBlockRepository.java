package com.enova.repository;

import com.enova.model.StudyPlanBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudyPlanBlockRepository extends JpaRepository<StudyPlanBlock, Long> {
    List<StudyPlanBlock> findByUserId(Long userId);
    List<StudyPlanBlock> findByUserIdAndDayOfWeek(Long userId, String dayOfWeek);
}
