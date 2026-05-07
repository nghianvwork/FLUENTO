package com.enova.service;

import com.enova.dto.response.ContentAiSummaryResponse;
import com.enova.model.ContentItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContentAiService {

    private final ContentService contentService;
    private final GeminiService geminiService;

    public ContentAiSummaryResponse summarize(Long contentId, String focus) {
        ContentItem item = contentService.getContentById(contentId);
        var json = geminiService.generateContentSummary(item.getTitle(), item.getSummary(), focus).orElse(null);
        if (json == null) {
            return ContentAiSummaryResponse.builder()
                    .contentId(contentId)
                    .summary(item.getSummary() != null ? item.getSummary() : "Summary unavailable")
                    .keyVocabulary(List.of())
                    .discussionQuestions(List.of())
                    .build();
        }
        List<String> vocab = JsonArrayReader.read(json.path("keyVocabulary"));
        List<String> questions = JsonArrayReader.read(json.path("discussionQuestions"));

        return ContentAiSummaryResponse.builder()
                .contentId(contentId)
                .summary(json.path("summary").asText(""))
                .keyVocabulary(vocab)
                .discussionQuestions(questions)
                .build();
    }

        private static class JsonArrayReader {
                static List<String> read(com.fasterxml.jackson.databind.JsonNode node) {
                        if (node == null || !node.isArray()) return List.of();
                        List<String> values = new java.util.ArrayList<>();
                        node.forEach(n -> values.add(n.asText()));
                        return values;
                }
        }
}
