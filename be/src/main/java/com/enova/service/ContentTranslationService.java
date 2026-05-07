package com.enova.service;

import com.enova.dto.request.ContentTranslationRequest;
import com.enova.dto.response.ContentTranslationResponse;
import com.enova.exception.ResourceNotFoundException;
import com.enova.model.ContentItem;
import com.enova.model.ContentTranslation;
import com.enova.model.User;
import com.enova.repository.ContentItemRepository;
import com.enova.repository.ContentTranslationRepository;
import com.enova.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentTranslationService {
    private final ContentTranslationRepository translationRepository;
    private final ContentItemRepository contentItemRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;

    @Transactional
    public ContentTranslationResponse createTranslation(Long contentId, Long userId, ContentTranslationRequest request) {
        ContentItem content = contentItemRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String translatedText = geminiService.translateText(
                request.getOriginalText(),
                request.getSourceLanguage(),
                request.getTargetLanguage()
        );

        ContentTranslation translation = ContentTranslation.builder()
                .content(content)
                .user(user)
                .originalText(request.getOriginalText())
                .translatedText(translatedText)
                .sourceLanguage(request.getSourceLanguage())
                .targetLanguage(request.getTargetLanguage())
                .timestampSeconds(request.getTimestampSeconds())
                .build();

        translation = translationRepository.save(translation);
        return ContentTranslationResponse.from(translation);
    }

    public List<ContentTranslationResponse> getTranslationsByContent(Long contentId, Long userId) {
        return translationRepository.findByContentIdAndUserIdOrderByCreatedAtDesc(contentId, userId)
                .stream()
                .map(ContentTranslationResponse::from)
                .collect(Collectors.toList());
    }

    public List<ContentTranslationResponse> getUserTranslations(Long userId) {
        return translationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ContentTranslationResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteTranslation(Long translationId, Long userId) {
        translationRepository.deleteByIdAndUserId(translationId, userId);
    }
}
