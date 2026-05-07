package com.enova.service;

import com.enova.dto.request.ContentVocabularyRequest;
import com.enova.dto.response.ContentVocabularyResponse;
import com.enova.model.ContentItem;
import com.enova.model.ContentVocabulary;
import com.enova.model.User;
import com.enova.repository.ContentVocabularyRepository;
import com.enova.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentVocabularyService {
    private final ContentVocabularyRepository vocabularyRepository;
    private final ContentService contentService;
    private final UserRepository userRepository;

    public List<ContentVocabularyResponse> getUserVocabulary(Long userId, Long contentId) {
        List<ContentVocabulary> vocabs = contentId != null
                ? vocabularyRepository.findByUserIdAndContentIdOrderByCreatedAtDesc(userId, contentId)
                : vocabularyRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return vocabs.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ContentVocabularyResponse saveVocabulary(Long userId, ContentVocabularyRequest request) {
        ContentItem content = contentService.getContentById(request.getContentId());
        User user = userRepository.findById(userId).orElseThrow();

        ContentVocabulary vocab = vocabularyRepository
                .findByUserIdAndContentIdAndWord(userId, request.getContentId(), request.getWord())
                .orElse(ContentVocabulary.builder()
                        .content(content)
                        .user(user)
                        .word(request.getWord())
                        .build());

        vocab.setDefinition(request.getDefinition());
        vocab.setExampleSentence(request.getExampleSentence());
        vocab.setTimestampSeconds(request.getTimestampSeconds());
        vocab.setCreatedAt(LocalDateTime.now());

        return toResponse(vocabularyRepository.save(vocab));
    }

    @Transactional
    public void deleteVocabulary(Long userId, Long vocabId) {
        ContentVocabulary vocab = vocabularyRepository.findById(vocabId).orElseThrow();
        if (!vocab.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        vocabularyRepository.delete(vocab);
    }

    private ContentVocabularyResponse toResponse(ContentVocabulary vocab) {
        return ContentVocabularyResponse.builder()
                .id(vocab.getId())
                .contentId(vocab.getContent().getId())
                .contentTitle(vocab.getContent().getTitle())
                .word(vocab.getWord())
                .definition(vocab.getDefinition())
                .exampleSentence(vocab.getExampleSentence())
                .timestampSeconds(vocab.getTimestampSeconds())
                .createdAt(vocab.getCreatedAt())
                .build();
    }
}
