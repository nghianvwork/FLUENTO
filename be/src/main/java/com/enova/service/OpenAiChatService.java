package com.enova.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OpenAiChatService {

    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    @Value("${openai.api-key:}")
    private String apiKey;

    @Value("${openai.chat.model:gpt-4o-mini}")
    private String chatModel;

    public Optional<String> generateAccentFeedback(String prompt, String transcript, int accuracy,
                                                   List<String> missing, List<String> extra) {
        if (apiKey == null || apiKey.isBlank()) return Optional.empty();

        String userMessage = "Expected prompt: " + safe(prompt)
                + "\nTranscript: " + safe(transcript)
                + "\nAccuracy: " + accuracy
                + "\nMissing words: " + String.join(", ", missing)
                + "\nExtra words: " + String.join(", ", extra)
                + "\nGive 2-3 short Vietnamese sentences with concrete pronunciation tips. Avoid generic advice.";

        try {
            var payload = objectMapper.createObjectNode();
            payload.put("model", chatModel);
            payload.put("temperature", 0.4);
            payload.put("max_tokens", 180);
            payload.putArray("messages")
                    .add(objectMapper.createObjectNode()
                            .put("role", "system")
                            .put("content", "You are an English pronunciation coach for Vietnamese learners."))
                    .add(objectMapper.createObjectNode()
                            .put("role", "user")
                            .put("content", userMessage));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .timeout(Duration.ofSeconds(30))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload.toString(), StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode content = root.path("choices").path(0).path("message").path("content");
            if (content.isMissingNode()) return Optional.empty();
            return Optional.ofNullable(content.asText());
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
