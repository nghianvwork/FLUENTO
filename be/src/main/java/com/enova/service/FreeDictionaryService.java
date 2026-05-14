package com.enova.service;

import com.enova.model.CareerPath;
import com.enova.model.Scenario;
import com.enova.model.Vocabulary;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class FreeDictionaryService {

    private static final String API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en/";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public FreeDictionaryService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Look up a word from Free Dictionary API and return raw JSON response.
     */
    public Optional<JsonNode> lookupWord(String word) {
        try {
            String url = API_BASE + word.trim().toLowerCase().replaceAll("\\s+", "%20");
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                log.warn("Dictionary API returned {} for word: {}", response.statusCode(), word);
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(response.body());
            if (root.isArray() && root.size() > 0) {
                return Optional.of(root.get(0));
            }
            return Optional.empty();
        } catch (Exception e) {
            log.error("Error looking up word '{}': {}", word, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Look up a word and create Vocabulary entries for each part of speech.
     * Each meaning (noun, verb, adjective, etc.) becomes a separate Vocabulary record.
     */
    public List<Vocabulary> lookupAndCreateVocabularies(String word, CareerPath careerPath, String meaningVi) {
        List<Vocabulary> vocabularies = new ArrayList<>();
        Optional<JsonNode> result = lookupWord(word);

        if (result.isEmpty()) {
            // Fallback: create a basic entry without dictionary enrichment
            vocabularies.add(Vocabulary.builder()
                    .word(word)
                    .careerPath(careerPath)
                    .meaningVi(meaningVi != null ? meaningVi : "")
                    .source("GEMINI_AI")
                    .difficulty(Scenario.Difficulty.INTERMEDIATE)
                    .frequencyRank(0)
                    .build());
            return vocabularies;
        }

        JsonNode entry = result.get();

        // Extract global phonetic info
        String phonetic = entry.path("phonetic").asText("");
        String audioUrl = extractBestAudioUrl(entry.path("phonetics"));

        // If global phonetic is empty, try to get from phonetics array
        if (phonetic.isEmpty()) {
            for (JsonNode ph : entry.path("phonetics")) {
                String text = ph.path("text").asText("");
                if (!text.isEmpty()) {
                    phonetic = text;
                    break;
                }
            }
        }

        // Process each meaning (part of speech)
        JsonNode meanings = entry.path("meanings");
        if (meanings.isArray()) {
            for (JsonNode meaning : meanings) {
                String partOfSpeech = meaning.path("partOfSpeech").asText("unknown");
                JsonNode definitions = meaning.path("definitions");

                // Build combined definition text
                StringBuilder defBuilder = new StringBuilder();
                List<String> examples = new ArrayList<>();
                int defCount = 0;

                if (definitions.isArray()) {
                    for (JsonNode def : definitions) {
                        if (defCount >= 3) break; // Max 3 definitions per part of speech
                        String defText = def.path("definition").asText("");
                        if (!defText.isEmpty()) {
                            defCount++;
                            defBuilder.append(defCount).append(". ").append(defText).append("\n");
                        }
                        String example = def.path("example").asText("");
                        if (!example.isEmpty()) {
                            examples.add(example);
                        }
                    }
                }

                // Extract synonyms and antonyms
                List<String> synonyms = extractStringArray(meaning.path("synonyms"));
                List<String> antonyms = extractStringArray(meaning.path("antonyms"));

                // Also collect from individual definitions
                if (definitions.isArray()) {
                    for (JsonNode def : definitions) {
                        synonyms.addAll(extractStringArray(def.path("synonyms")));
                        antonyms.addAll(extractStringArray(def.path("antonyms")));
                    }
                }

                // Deduplicate
                synonyms = synonyms.stream().distinct().limit(10).toList();
                antonyms = antonyms.stream().distinct().limit(10).toList();

                try {
                    Vocabulary vocab = Vocabulary.builder()
                            .word(word)
                            .careerPath(careerPath)
                            .phonetic(phonetic)
                            .audioUrl(audioUrl)
                            .partOfSpeech(partOfSpeech)
                            .definition(defBuilder.toString().trim())
                            .meaningVi(meaningVi != null ? meaningVi : "")
                            .exampleSentences(objectMapper.writeValueAsString(examples))
                            .synonyms(objectMapper.writeValueAsString(synonyms))
                            .antonyms(objectMapper.writeValueAsString(antonyms))
                            .source("DICTIONARY_API")
                            .difficulty(Scenario.Difficulty.INTERMEDIATE)
                            .frequencyRank(0)
                            .build();
                    vocabularies.add(vocab);
                } catch (Exception e) {
                    log.error("Error building vocabulary for '{}' ({}): {}", word, partOfSpeech, e.getMessage());
                }
            }
        }

        // If no meanings found, still create a basic entry
        if (vocabularies.isEmpty()) {
            vocabularies.add(Vocabulary.builder()
                    .word(word)
                    .careerPath(careerPath)
                    .phonetic(phonetic)
                    .audioUrl(audioUrl)
                    .meaningVi(meaningVi != null ? meaningVi : "")
                    .source("DICTIONARY_API")
                    .difficulty(Scenario.Difficulty.INTERMEDIATE)
                    .frequencyRank(0)
                    .build());
        }

        return vocabularies;
    }

    /**
     * Look up a single word and return a structured DTO-like JsonNode for the frontend.
     */
    public Optional<JsonNode> lookupWordFull(String word) {
        return lookupWord(word);
    }

    /**
     * Extract the best audio URL (prefer US/UK pronunciation).
     */
    private String extractBestAudioUrl(JsonNode phonetics) {
        if (!phonetics.isArray()) return "";

        String fallbackAudio = "";
        for (JsonNode ph : phonetics) {
            String audio = ph.path("audio").asText("");
            if (audio.isEmpty()) continue;

            // Prefer US or UK pronunciation
            if (audio.contains("-us") || audio.contains("-uk")) {
                return audio;
            }
            if (fallbackAudio.isEmpty()) {
                fallbackAudio = audio;
            }
        }
        return fallbackAudio;
    }

    /**
     * Extract a string array from a JsonNode array.
     */
    private List<String> extractStringArray(JsonNode node) {
        List<String> result = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode item : node) {
                String val = item.asText("");
                if (!val.isEmpty()) {
                    result.add(val);
                }
            }
        }
        return result;
    }
}
