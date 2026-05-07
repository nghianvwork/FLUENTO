package com.enova.service;

import com.enova.model.Scenario;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GeminiService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String model;

    public Optional<String> generateChatResponse(String message, String context, String tone) {
        String prompt = "You are ENOVA's AI tutor. "
                + (tone != null && !tone.isBlank() ? "Tone: " + tone + ". " : "")
                + (context != null && !context.isBlank() ? "Context: " + context + ". " : "")
                + "User message: " + message;
        return generateText(prompt, 0.6, 512);
    }

    public Optional<String> generateRoleplayResponse(Scenario scenario, String userMessage, List<String> recentTurns) {
        String history = recentTurns == null || recentTurns.isEmpty()
                ? ""
                : "Recent conversation: " + String.join(" | ", recentTurns) + ". ";
        String prompt = "You are a professional English roleplay partner. "
                + "Scenario: " + scenario.getTitle() + ". "
                + "Category: " + scenario.getCategory() + ". "
                + "Difficulty: " + scenario.getDifficulty() + ". "
                + "Personality: " + scenario.getAiPersonality() + ". "
                + "Context: " + scenario.getContextPrompt() + ". "
                + history
                + "User said: " + userMessage + ". "
                + "Reply naturally with 2-4 sentences. Avoid repeating the same phrasing.";
        return generateText(prompt, 0.8, 256);
    }

    public Optional<String> generateAdminInsights(String focus, Map<String, Object> metrics) {
        String prompt = "You are an operations analyst for ENOVA. "
                + "Focus: " + (focus == null || focus.isBlank() ? "overall" : focus) + ". "
                + "Metrics: " + metrics + ". "
                + "Provide 3 insights and 3 actions in bullet points.";
        return generateText(prompt, 0.4, 384);
    }

        public Optional<JsonNode> generateEmotionAnalysis(String text, String context) {
                String prompt = "You are an empathy coach. Analyze the user's emotion from the text. "
                                + (context != null && !context.isBlank() ? "Context: " + context + ". " : "")
                                + "Text: " + text + ". "
                                + "Return JSON with keys emotion, confidence, coachingTone, suggestion.";
                return generateJson(prompt, 0.3, 256);
        }

        public Optional<JsonNode> generateContentSummary(String title, String summary, String focus) {
                String prompt = "You are an English learning content editor. "
                                + "Title: " + title + ". "
                                + (summary != null && !summary.isBlank() ? "Summary: " + summary + ". " : "")
                                + (focus != null && !focus.isBlank() ? "Focus: " + focus + ". " : "")
                                + "Return JSON with keys summary, keyVocabulary (array of 6 words), discussionQuestions (array of 3).";
                return generateJson(prompt, 0.4, 384);
        }

        public Optional<JsonNode> generateContentQuizzes(String title, String summary) {
                String prompt = "Generate 5 multiple choice questions about this content:\nTitle: " + title + "\nSummary: " + summary + "\n\n" +
                                "Return JSON array with format: [{\"question\": \"...\", \"optionA\": \"...\", \"optionB\": \"...\", " +
                                "\"optionC\": \"...\", \"optionD\": \"...\", \"correctAnswer\": \"A\", \"explanation\": \"...\"}]";
                return generateJson(prompt, 0.4, 512);
        }

        public String translateText(String text, String sourceLanguage, String targetLanguage) {
                String prompt = "Translate the following text from " + sourceLanguage + " to " + targetLanguage + ". " +
                                "Only return the translation, no explanations:\n\n" + text;
                return generateText(prompt, 0.3, 512).orElse(text);
        }

    private Optional<String> generateText(String prompt, double temperature, int maxTokens) {
        if (apiKey == null || apiKey.isBlank()) return Optional.empty();

        try {
            Map<String, Object> payload = Map.of(
                    "contents", List.of(Map.of(
                            "role", "user",
                            "parts", List.of(Map.of("text", prompt))
                    )),
                    "generationConfig", Map.of(
                            "temperature", temperature,
                            "maxOutputTokens", maxTokens
                    )
            );

            String body = objectMapper.writeValueAsString(payload);
            String url = String.format(
                    "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    model,
                    apiKey
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(20))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode textNode = root.path("candidates").path(0)
                    .path("content").path("parts").path(0).path("text");
            if (textNode.isMissingNode()) return Optional.empty();

            return Optional.ofNullable(textNode.asText());
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

        private Optional<JsonNode> generateJson(String prompt, double temperature, int maxTokens) {
                Optional<String> raw = generateText(prompt, temperature, maxTokens);
                if (raw.isEmpty()) return Optional.empty();
                try {
                        String text = raw.get().trim();
                        int startObj = text.indexOf('{');
                        int startArr = text.indexOf('[');
                        int endObj = text.lastIndexOf('}');
                        int endArr = text.lastIndexOf(']');
                        
                        int start = (startObj >= 0 && startArr >= 0) ? Math.min(startObj, startArr) : Math.max(startObj, startArr);
                        int end = (endObj >= 0 && endArr >= 0) ? Math.max(endObj, endArr) : Math.max(endObj, endArr);

                        if (start >= 0 && end > start) {
                                text = text.substring(start, end + 1);
                        }
                        return Optional.ofNullable(objectMapper.readTree(text));
                } catch (Exception ex) {
                        ObjectNode fallback = objectMapper.createObjectNode();
                        fallback.put("summary", raw.get());
                        return Optional.of(fallback);
                }
        }
}
