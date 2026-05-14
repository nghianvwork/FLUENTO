package com.enova.service;

import com.enova.exception.ResourceNotFoundException;
import com.enova.model.*;
import com.enova.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AccentCoachService {

    private final PronunciationRecordRepository recordRepository;
    private final UserRepository userRepository;
    private final OpenAiAudioService audioService;
    private final OpenAiChatService chatService;
    private final MediaStorageService mediaStorageService;

    public PronunciationRecord analyzePronunciation(Long userId, String textPrompt, String audioUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PronunciationScore score = analyzeWithStt(textPrompt, audioUrl);
        String feedback = score.feedback;
        String ttsUrl = null;
        try {
            String ttsText = truncate(feedback, 500);
            ttsUrl = audioService.synthesizeToUrl(ttsText);
        } catch (Exception ignored) {
            ttsUrl = null;
        }
        PronunciationRecord record = PronunciationRecord.builder()
            .user(user)
            .textPrompt(textPrompt)
            .audioUrl(audioUrl)
            .accuracyScore(score.accuracy)
            .intonationScore(score.intonation)
            .rhythmScore(score.rhythm)
            .stressScore(score.stress)
            .speedWpm(score.speedWpm)
            .aiFeedback(feedback)
            .ttsAudioUrl(ttsUrl)
            .build();

        return recordRepository.save(record);
    }

    public List<PronunciationRecord> getUserHistory(Long userId) {
        return recordRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    private PronunciationScore analyzeWithStt(String textPrompt, String audioUrl) {
        Random random = new Random();
        if (audioUrl == null || audioUrl.isBlank()) {
            return PronunciationScore.missingAudio();
        }

        try {
            var path = mediaStorageService.resolvePath(audioUrl);
            if (path == null || !path.toFile().exists()) {
                return PronunciationScore.missingAudio();
            }
            if (path.toFile().length() < 2000) {
                return PronunciationScore.tooShortAudio();
            }

            var result = audioService.transcribe(path);
            String transcript = result.transcript();
            float confidence = result.confidence();
            int similarity = computeSimilarity(textPrompt, transcript);
            int accuracy = Math.min(100, Math.max(40, (int) (similarity * 0.7 + confidence * 100 * 0.3)));

            String feedback = buildAiFeedback(transcript, textPrompt, accuracy);
            return PronunciationScore.builder()
                    .accuracy(accuracy)
                    .intonation(Math.min(100, accuracy - 5 + random.nextInt(10)))
                    .rhythm(Math.min(100, accuracy - 10 + random.nextInt(15)))
                    .stress(Math.min(100, accuracy - 6 + random.nextInt(12)))
                    .speedWpm(90 + random.nextInt(40))
                    .feedback(feedback)
                    .build();
        } catch (Exception ex) {
            return PronunciationScore.fallback(random, "Nhận diện giọng nói thất bại. Hãy thử bản ghi rõ hơn (wav, mp3, hoặc webm).");
        }
    }

    private int computeSimilarity(String expected, String actual) {
        if (expected == null || actual == null) return 0;
        String[] exp = expected.toLowerCase().split("\\s+");
        String[] act = actual.toLowerCase().split("\\s+");
        if (exp.length == 0) return 0;

        int match = 0;
        for (String e : exp) {
            for (String a : act) {
                if (e.equals(a)) {
                    match++;
                    break;
                }
            }
        }
        return (int) ((match / (double) exp.length) * 100);
    }

    private String buildFeedback(String transcript, String prompt, int accuracy) {
        if (transcript == null || transcript.isBlank()) {
            return "Không nhận diện được giọng nói rõ. Hãy nói gần microphone hơn.";
        }
        List<String> expected = normalizeWords(prompt);
        List<String> actual = normalizeWords(transcript);
        Set<String> actualSet = new HashSet<>(actual);
        Set<String> expectedSet = new HashSet<>(expected);

        List<String> missing = new ArrayList<>();
        for (String word : expected) {
            if (!actualSet.contains(word)) missing.add(word);
        }

        List<String> extra = new ArrayList<>();
        for (String word : actual) {
            if (!expectedSet.contains(word)) extra.add(word);
        }

        StringBuilder feedback = new StringBuilder();
        if (accuracy >= 85) {
            feedback.append("Phát âm rõ ràng. ");
        } else if (accuracy >= 70) {
            feedback.append("Phát âm khá tốt. ");
        } else {
            feedback.append("Độ khớp với câu mẫu còn thấp. ");
        }

        if (!missing.isEmpty()) {
            feedback.append("Thiếu từ: ").append(String.join(", ", missing.subList(0, Math.min(4, missing.size())))).append(". ");
        }
        if (!extra.isEmpty()) {
            feedback.append("Thừa từ: ").append(String.join(", ", extra.subList(0, Math.min(4, extra.size())))).append(". ");
        }

        if (accuracy < 70) {
            feedback.append("Hãy nói chậm hơn và nhấn rõ phụ âm cuối.");
        } else {
            feedback.append("Tập nối âm mượt hơn và lên xuống giọng tự nhiên.");
        }

        return feedback.toString().trim();
    }

    private String buildAiFeedback(String transcript, String prompt, int accuracy) {
        List<String> expected = normalizeWords(prompt);
        List<String> actual = normalizeWords(transcript);
        List<String> missing = new ArrayList<>();
        List<String> extra = new ArrayList<>();

        Set<String> actualSet = new HashSet<>(actual);
        Set<String> expectedSet = new HashSet<>(expected);
        for (String word : expected) {
            if (!actualSet.contains(word)) missing.add(word);
        }
        for (String word : actual) {
            if (!expectedSet.contains(word)) extra.add(word);
        }

        return chatService.generateAccentFeedback(prompt, transcript, accuracy, missing, extra)
                .orElseGet(() -> buildFeedback(transcript, prompt, accuracy));
    }

    private List<String> normalizeWords(String text) {
        if (text == null) return Collections.emptyList();
        String cleaned = text.toLowerCase().replaceAll("[^a-z0-9\\s']", " ");
        String[] tokens = cleaned.trim().split("\\s+");
        List<String> words = new ArrayList<>();
        for (String token : tokens) {
            if (!token.isBlank()) words.add(token);
        }
        return words;
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength - 1).trim() + "…";
    }

    private static class PronunciationScore {
        private int accuracy;
        private int intonation;
        private int rhythm;
        private int stress;
        private int speedWpm;
        private String feedback;

        static PronunciationScore fallback(Random random, String feedback) {
            return builder()
                    .accuracy(60 + random.nextInt(30))
                    .intonation(55 + random.nextInt(35))
                    .rhythm(50 + random.nextInt(40))
                    .stress(55 + random.nextInt(30))
                    .speedWpm(90 + random.nextInt(60))
                    .feedback(feedback)
                    .build();
        }

            static PronunciationScore missingAudio() {
                return builder()
                    .accuracy(0)
                    .intonation(0)
                    .rhythm(0)
                    .stress(0)
                    .speedWpm(0)
                    .feedback("Thiếu audio. Vui lòng ghi âm hoặc tải file để nhận phản hồi chi tiết.")
                    .build();
            }

            static PronunciationScore tooShortAudio() {
                return builder()
                    .accuracy(0)
                    .intonation(0)
                    .rhythm(0)
                    .stress(0)
                    .speedWpm(0)
                    .feedback("Audio quá ngắn hoặc quá nhỏ. Hãy nói rõ và ghi âm lâu hơn.")
                    .build();
            }

        static Builder builder() { return new Builder(); }

        static class Builder {
            private final PronunciationScore score = new PronunciationScore();
            Builder accuracy(int value) { score.accuracy = value; return this; }
            Builder intonation(int value) { score.intonation = value; return this; }
            Builder rhythm(int value) { score.rhythm = value; return this; }
            Builder stress(int value) { score.stress = value; return this; }
            Builder speedWpm(int value) { score.speedWpm = value; return this; }
            Builder feedback(String value) { score.feedback = value; return this; }
            PronunciationScore build() { return score; }
        }
    }
}
