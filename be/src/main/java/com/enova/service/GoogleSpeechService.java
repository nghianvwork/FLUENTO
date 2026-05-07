package com.enova.service;

import com.google.cloud.speech.v1.*;
import com.google.protobuf.ByteString;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
@RequiredArgsConstructor
public class GoogleSpeechService {

    @Value("${google.stt.language:en-US}")
    private String languageCode;

    @Value("${google.stt.sample-rate:16000}")
    private int sampleRate;

    @Value("${google.stt.encoding:LINEAR16}")
    private String encoding;

    public SpeechRecognitionResult transcribe(Path audioPath) throws IOException {
        byte[] data = Files.readAllBytes(audioPath);
        ByteString audioBytes = ByteString.copyFrom(data);

        RecognitionConfig.AudioEncoding audioEncoding = switch (encoding) {
            case "MP3" -> RecognitionConfig.AudioEncoding.MP3;
            case "WEBM_OPUS" -> RecognitionConfig.AudioEncoding.WEBM_OPUS;
            default -> RecognitionConfig.AudioEncoding.LINEAR16;
        };

        RecognitionConfig config = RecognitionConfig.newBuilder()
                .setEncoding(audioEncoding)
                .setSampleRateHertz(sampleRate)
                .setLanguageCode(languageCode)
                .setEnableAutomaticPunctuation(true)
                .build();

        RecognitionAudio audio = RecognitionAudio.newBuilder().setContent(audioBytes).build();

        try (SpeechClient speechClient = SpeechClient.create()) {
            RecognizeResponse response = speechClient.recognize(config, audio);
            if (response.getResultsCount() == 0) {
                return SpeechRecognitionResult.empty();
            }
            SpeechRecognitionAlternative best = response.getResults(0).getAlternatives(0);
            return SpeechRecognitionResult.builder()
                    .transcript(best.getTranscript())
                    .confidence(best.getConfidence())
                    .build();
        }
    }

    public record SpeechRecognitionResult(String transcript, float confidence) {
        public static SpeechRecognitionResult empty() {
            return new SpeechRecognitionResult("", 0f);
        }
        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private String transcript;
            private float confidence;
            public Builder transcript(String transcript) { this.transcript = transcript; return this; }
            public Builder confidence(float confidence) { this.confidence = confidence; return this; }
            public SpeechRecognitionResult build() { return new SpeechRecognitionResult(transcript, confidence); }
        }
    }
}
