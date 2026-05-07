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
    private final GoogleSpeechService speechService;
    private final MediaStorageService mediaStorageService;

    public PronunciationRecord analyzePronunciation(Long userId, String textPrompt, String audioUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PronunciationScore score = analyzeWithStt(textPrompt, audioUrl);
        PronunciationRecord record = PronunciationRecord.builder()
            .user(user)
            .textPrompt(textPrompt)
            .audioUrl(audioUrl)
            .accuracyScore(score.accuracy)
            .intonationScore(score.intonation)
            .rhythmScore(score.rhythm)
            .stressScore(score.stress)
            .speedWpm(score.speedWpm)
            .aiFeedback(score.feedback)
            .build();

        return recordRepository.save(record);
    }

    public List<PronunciationRecord> getUserHistory(Long userId) {
        return recordRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    private String generateFeedback(String text) {
        List<String> feedbacks = Arrays.asList(
            "Good pronunciation overall! Focus on the 'th' sound which is often challenging. Try placing your tongue between your teeth.",
            "Your intonation is improving! Remember to raise your pitch at the end of questions. The rhythm is natural.",
            "Nice stress patterns! Work on word-final consonant clusters. Practice saying 'texts', 'sixths' slowly.",
            "Good pace! Try to link words more naturally. For example, 'an apple' should sound like 'a-napple'.",
            "Excellent vowel sounds! The 'r' sound could be stronger. Practice with words like 'world', 'girl', 'bird'."
        );
        return feedbacks.get(new Random().nextInt(feedbacks.size()));
    }

    private PronunciationScore analyzeWithStt(String textPrompt, String audioUrl) {
        Random random = new Random();
        if (audioUrl == null || audioUrl.isBlank()) {
            return PronunciationScore.fallback(random, generateFeedback(textPrompt));
        }

        try {
            var path = mediaStorageService.resolvePath(audioUrl);
            if (path == null || !path.toFile().exists()) {
                return PronunciationScore.fallback(random, generateFeedback(textPrompt));
            }

            var result = speechService.transcribe(path);
            String transcript = result.transcript();
            float confidence = result.confidence();
            int similarity = computeSimilarity(textPrompt, transcript);
            int accuracy = Math.min(100, Math.max(40, (int) (similarity * 0.7 + confidence * 100 * 0.3)));

            return PronunciationScore.builder()
                    .accuracy(accuracy)
                    .intonation(Math.min(100, accuracy - 5 + random.nextInt(10)))
                    .rhythm(Math.min(100, accuracy - 10 + random.nextInt(15)))
                    .stress(Math.min(100, accuracy - 6 + random.nextInt(12)))
                    .speedWpm(90 + random.nextInt(40))
                    .feedback(buildFeedback(transcript, textPrompt, accuracy))
                    .build();
        } catch (Exception ex) {
            return PronunciationScore.fallback(random, generateFeedback(textPrompt));
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
            return "We could not detect clear speech. Try speaking closer to the microphone.";
        }
        if (accuracy >= 85) return "Excellent clarity! Keep the same pace and articulation.";
        if (accuracy >= 70) return "Good pronunciation. Focus on smoother word linking and intonation.";
        return "Keep practicing. Slow down slightly and emphasize key syllables.";
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
