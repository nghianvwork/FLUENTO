package com.enova.dto.response;

import com.enova.model.Vocabulary;
import com.enova.model.VocabularyProgress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VocabularyProgressResponse {
    private Long id;
    private Long vocabularyId;
    private String word;
    private String definition;
    private String exampleSentence;
    private String source;
    private Integer masteryLevel;
    private LocalDateTime nextReviewAt;
    
    public static VocabularyProgressResponse from(VocabularyProgress vp) {
        Vocabulary vocab = vp.getVocabulary();
        return VocabularyProgressResponse.builder()
                .id(vp.getId())
                .vocabularyId(vocab.getId())
                .word(vocab.getWord())
                .definition(vocab.getDefinition())
                .exampleSentence(vocab.getExampleSentences())
                .source(vocab.getCareerPath() != null ? vocab.getCareerPath().getName() : null)
                .masteryLevel(vp.getMasteryLevel())
                .nextReviewAt(vp.getNextReviewAt())
                .build();
    }
}
