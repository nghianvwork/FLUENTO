package com.enova.service;

import com.enova.model.Scenario;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final String FALLBACK_MODEL = "gemini-1.5-flash";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
    }

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

    public Optional<JsonNode> generateContentMixedQuizzes(String title, String summary) {
        String prompt = "Generate 6 mixed quiz questions about this content. "
                + "Use questionType in [MULTIPLE_CHOICE, FILL_BLANK, SENTENCE_ORDER]. "
                + "Title: " + title + ". Summary: " + summary + ". "
                + "Return JSON array with objects: {"
                + "questionType, question, options, optionA, optionB, optionC, optionD, correctAnswer, explanation}. "
                + "Rules: For MULTIPLE_CHOICE, provide optionA-D and correctAnswer as A/B/C/D. "
                + "For FILL_BLANK, provide correctAnswer as the exact text, options as an array of 3-5 hints (optional). "
                + "For SENTENCE_ORDER, provide options as array of parts and correctAnswer as array in correct order.";
        return generateJson(prompt, 0.5, 1024);
    }

    public Optional<JsonNode> generateContentTests(String title, String summary) {
        String prompt = "Create a mixed-format test for this content. "
                + "Title: " + title + ". Summary: " + summary + ". "
                + "Return JSON object: {title, description, timeLimit, passingScore, questions:[...]} "
                + "Each question: {questionType, question, options, correctAnswer, explanation, points}. "
                + "questionType in [MULTIPLE_CHOICE, FILL_BLANK, SENTENCE_ORDER]. "
                + "For MULTIPLE_CHOICE, options is an object {A:..,B:..,C:..,D:..} and correctAnswer is A/B/C/D. "
                + "For FILL_BLANK, correctAnswer is the exact text; options can be an array of hints. "
                + "For SENTENCE_ORDER, options is an array of parts and correctAnswer is an array in correct order.";
        return generateJson(prompt, 0.5, 1536);
    }

    public Optional<JsonNode> generateStructuredLessons(String levelCode) {
        String prompt = "Create 6 structured English lessons for CEFR level " + levelCode + ". "
                + "Return a JSON array. Each lesson: {title, description, lessonType, estimatedMinutes, blocks}. "
                + "lessonType in [VOCABULARY, GRAMMAR, SPEAKING, LISTENING, WRITING, READING]. "
                + "blocks is an array of 3-5 items with format: {type, prompt, options, answer, audioText}. "
                + "type in [READING, LISTENING, WRITING, SPEAKING]. "
                + "For READING, include options array. For LISTENING, include audioText."
                + "Keep prompts concise and practical.";
        return generateJson(prompt, 0.6, 2048);
    }

    public Optional<JsonNode> generatePersonalizedPlan(String displayName,
                                                       String careerIndustry,
                                                       String careerGoal,
                                                       String cefrLevel,
                                                       String targetLevel,
                                                       int dailyGoalMinutes,
                                                       String focus) {
        String prompt = "Create a personalized English learning plan. "
                + "User: " + (displayName == null ? "" : displayName) + ". "
                + "Career industry: " + (careerIndustry == null ? "" : careerIndustry) + ". "
                + "Career goal: " + (careerGoal == null ? "" : careerGoal) + ". "
                + "Current CEFR: " + cefrLevel + ", Target CEFR: " + targetLevel + ". "
                + "Daily goal minutes: " + dailyGoalMinutes + ". "
                + (focus != null && !focus.isBlank() ? "Focus: " + focus + ". " : "")
                + "Return JSON: {title, summary, weeklyPlan:[{day, focus, activities:[{type, title, minutes, skills}]}], "
                + "recommendedLessons:[{level, title, reason}]}";
        return generateJson(prompt, 0.5, 2048);
    }

    public String translateText(String text, String sourceLanguage, String targetLanguage) {
        String prompt = "Translate the following text from " + sourceLanguage + " to " + targetLanguage + ". " +
                "Only return the translation, no explanations:\n\n" + text;
        return generateText(prompt, 0.3, 512).orElse(text);
    }

    public Optional<JsonNode> generateCareerVocabulary(String industry, int count) {
        String prompt = "You are an English language expert. Generate " + count + " unique English vocabulary words commonly used in the '" + industry + "' industry. "
                + "Return a JSON array of objects. Format: "
                + "[{\"word\": \"...\", \"phonetic\": \"...\", \"partOfSpeech\": \"...\", \"definition\": \"...\", \"meaningVi\": \"...\", \"exampleSentences\": [\"sentence 1\", \"sentence 2\"]}] "
                + "meaningVi must be in Vietnamese. definition must be in English.";
        return generateJson(prompt, 0.6, 8192);
    }

    public Optional<JsonNode> generateCareerLesson(String industry, String topic) {
        String prompt = "Generate a structured English lesson for the '" + industry + "' industry about '" + topic + "'. "
                + "Return JSON with format: {\"title\": \"...\", \"words\": [\"word1\", \"word2\", ...], \"exercises\": [{\"type\": \"match\", \"question\": \"...\", \"options\": [...]}, {\"type\": \"fill_blank\", \"question\": \"...\", \"answer\": \"...\"}]}. "
                + "Include 5 key words and 5 exercises.";
        return generateJson(prompt, 0.5, 2048);
    }

    public Optional<JsonNode> generateWordListForDictionary(String industry, int count) {
        String prompt = "You are an English language expert specializing in industry vocabulary. "
                + "Generate a JSON array of " + count + " common English words used in the '" + industry + "' industry. "
                + "Include a mix of nouns, verbs, adjectives, and adverbs. "
                + "IMPORTANT: Only include real English words that exist in a standard dictionary. "
                + "Avoid abbreviations, acronyms, or compound phrases. "
                + "Return format: [{\"word\": \"negotiate\", \"meaningVi\": \"đàm phán\"}, {\"word\": \"collaborate\", \"meaningVi\": \"hợp tác\"}] "
                + "meaningVi must be accurate Vietnamese translation.";
        return generateJson(prompt, 0.7, 8192);
    }

    public Optional<JsonNode> generateExamQuestions(String examType, String section, String level) {
        String prompt = "Generate a full-length English certification practice test for " + examType + ". "
                + "Section: " + (section != null ? section : "Mixed") + ". "
                + "Difficulty Level: " + (level != null ? level : "Intermediate") + ". "
                + "Return a JSON object: {title, description, durationMinutes, questions:[...]} "
                + "Each question object: {questionText, options:[...], correctAnswer, explanation, section}. "
                + "For options, provide an array of 4 choices. For correctAnswer, provide the exact text. "
                + "Include 10 high-quality questions.";
        return generateJson(prompt, 0.6, 4096);
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

            Optional<String> primary = requestText(model, body);
            if (primary.isPresent()) return primary;

            if (!FALLBACK_MODEL.equalsIgnoreCase(model)) {
                return requestText(FALLBACK_MODEL, body);
            }

            return Optional.empty();
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    private Optional<String> requestText(String modelName, String body) {
        try {
            // Using v1 instead of v1beta for better stability with gemini-1.5 models
            String url = String.format(
                    "https://generativelanguage.googleapis.com/v1/models/%s:generateContent?key=%s",
                    modelName,
                    apiKey
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(60))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                String snippet = response.body() == null ? "" : response.body();
                if (snippet.length() > 600) {
                    snippet = snippet.substring(0, 600) + "...";
                }
                log.warn("Gemini request failed (model={}, status={}, body={})", modelName, response.statusCode(), snippet);
                return Optional.empty();
            }

            JsonNode rootResponse = objectMapper.readTree(response.body());
            JsonNode textNode = rootResponse.path("candidates").path(0)
                    .path("content").path("parts").path(0).path("text");
            if (textNode.isMissingNode()) return Optional.empty();

            return Optional.ofNullable(textNode.asText());
        } catch (Exception ex) {
            log.warn("Gemini request failed (model={})", modelName, ex);
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
