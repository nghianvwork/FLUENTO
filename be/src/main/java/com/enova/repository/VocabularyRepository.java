package com.enova.repository;

import com.enova.model.Vocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {
    List<Vocabulary> findByCareerPathIdOrderByFrequencyRank(Long careerPathId);
}
