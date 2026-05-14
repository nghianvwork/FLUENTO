package com.enova.service;

import com.enova.dto.response.MediaUploadResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OpenAiAudioService {

    private final ObjectMapper objectMapper;
    private final MediaStorageService mediaStorageService;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    @Value("${openai.api-key:}")
    private String apiKey;

    @Value("${openai.stt.model:gpt-4o-mini-transcribe}")
    private String sttModel;

    @Value("${openai.stt.language:en}")
    private String sttLanguage;

    @Value("${openai.tts.model:gpt-4o-mini-tts}")
    private String ttsModel;

    @Value("${openai.tts.voice:alloy}")
    private String ttsVoice;

    public SpeechResult transcribe(Path audioPath) throws IOException, InterruptedException {
        if (apiKey == null || apiKey.isBlank()) {
            return SpeechResult.empty();
        }
        SpeechResult first = requestTranscription(audioPath, true);
        if (first.transcript != null && !first.transcript.isBlank()) {
            return first;
        }
        return requestTranscription(audioPath, false);
    }

    private SpeechResult requestTranscription(Path audioPath, boolean includeLanguage)
            throws IOException, InterruptedException {
        String boundary = "----EnovaBoundary" + UUID.randomUUID();
        byte[] fileBytes = Files.readAllBytes(audioPath);
        String filename = audioPath.getFileName().toString();
        String contentType = detectContentType(filename);

        ByteArrayOutputStream body = new ByteArrayOutputStream();
        writePart(body, boundary, "model", sttModel);
        if (includeLanguage && sttLanguage != null && !sttLanguage.isBlank()) {
            writePart(body, boundary, "language", sttLanguage);
        }
        writeFilePart(body, boundary, "file", filename, contentType, fileBytes);
        body.write(("--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/audio/transcriptions"))
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(body.toByteArray()))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            return SpeechResult.empty();
        }

        JsonNode root = objectMapper.readTree(response.body());
        String transcript = root.path("text").asText("");
        return new SpeechResult(transcript, 0.85f);
    }

    public String synthesizeToUrl(String text) throws IOException, InterruptedException {
        if (apiKey == null || apiKey.isBlank() || text == null || text.isBlank()) {
            return null;
        }

        String payload = objectMapper.writeValueAsString(objectMapper.createObjectNode()
                .put("model", ttsModel)
                .put("voice", ttsVoice)
                .put("format", "mp3")
                .put("input", text));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/audio/speech"))
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
                .build();

        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
        if (response.statusCode() >= 400) {
            return null;
        }

        String filename = "tts-" + UUID.randomUUID() + ".mp3";
        MediaUploadResponse saved = mediaStorageService.storeBytes(response.body(), filename, "audio/mpeg");
        return saved.getUrl();
    }

    private void writePart(ByteArrayOutputStream body, String boundary, String name, String value) throws IOException {
        body.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(("Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(value.getBytes(StandardCharsets.UTF_8));
        body.write("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    private void writeFilePart(ByteArrayOutputStream body, String boundary, String name, String filename,
                               String contentType, byte[] data) throws IOException {
        body.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(("Content-Disposition: form-data; name=\"" + name + "\"; filename=\"" + filename + "\"\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(("Content-Type: " + contentType + "\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(data);
        body.write("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    private String detectContentType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".mp3")) return "audio/mpeg";
        if (lower.endsWith(".webm")) return "audio/webm";
        if (lower.endsWith(".wav")) return "audio/wav";
        return "application/octet-stream";
    }

    public record SpeechResult(String transcript, float confidence) {
        static SpeechResult empty() {
            return new SpeechResult("", 0f);
        }
    }
}
