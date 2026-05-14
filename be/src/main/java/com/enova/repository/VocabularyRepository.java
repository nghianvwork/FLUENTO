package com.enova.repository;

import com.enova.model.Vocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {
    List<Vocabulary> findByCareerPathIdOrderByFrequencyRank(Long careerPathId);
    Optional<Vocabulary> findByWordIgnoreCase(String word);
    List<Vocabulary> findByCareerPathIdAndPartOfSpeechIgnoreCaseOrderByFrequencyRank(Long careerPathId, String partOfSpeech);
    Optional<Vocabulary> findByCareerPathIdAndWordIgnoreCaseAndPartOfSpeechIgnoreCase(Long careerPathId, String word, String partOfSpeech);
    long countByCareerPathId(Long careerPathId);
}
