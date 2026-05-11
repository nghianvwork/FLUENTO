package com.enova.service;

import com.enova.exception.ResourceNotFoundException;
import com.enova.model.*;
import com.enova.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class CareerEngineService {

    private final CareerPathRepository careerPathRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final VocabularyRepository vocabularyRepository;
    private final VocabularyProgressRepository vocabProgressRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;

    public List<CareerPath> getAllCareerPaths() {
        return careerPathRepository.findAll();
    }

    public CareerPath getCareerPathById(Long id) {
        return careerPathRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Career path not found"));
    }

    public List<Lesson> getLessonsByCareerPath(Long careerPathId) {
        return lessonRepository.findByCareerPathIdOrderByOrderIndex(careerPathId);
    }

    public List<Vocabulary> getVocabularyByCareerPath(Long careerPathId) {
        return vocabularyRepository.findByCareerPathIdOrderByFrequencyRank(careerPathId);
    }

    public List<LessonProgress> getUserLessonProgress(Long userId) {
        return lessonProgressRepository.findByUserId(userId);
    }

    @Transactional
    public LessonProgress startLesson(Long userId, Long lessonId) {
        return lessonProgressRepository.findByUserIdAndLessonId(userId, lessonId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    Lesson lesson = lessonRepository.findById(lessonId)
                            .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));

                    LessonProgress progress = LessonProgress.builder()
                            .user(user)
                            .lesson(lesson)
                            .status(LessonProgress.ProgressStatus.IN_PROGRESS)
                            .startedAt(LocalDateTime.now())
                            .build();
                    return lessonProgressRepository.save(progress);
                });
    }

    @Transactional
    public LessonProgress completeLesson(Long userId, Long lessonId, Integer score) {
        LessonProgress progress = lessonProgressRepository.findByUserIdAndLessonId(userId, lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson progress not found"));

        progress.setStatus(LessonProgress.ProgressStatus.COMPLETED);
        progress.setScore(score);
        progress.setCompletedAt(LocalDateTime.now());
        return lessonProgressRepository.save(progress);
    }

    @Transactional
    public VocabularyProgress reviewVocabulary(Long userId, Long vocabularyId, boolean correct) {
        VocabularyProgress progress = vocabProgressRepository
                .findByUserIdAndVocabularyId(userId, vocabularyId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    Vocabulary vocab = vocabularyRepository.findById(vocabularyId)
                            .orElseThrow(() -> new ResourceNotFoundException("Vocabulary not found"));

                    return VocabularyProgress.builder()
                            .user(user)
                            .vocabulary(vocab)
                            .build();
                });

        progress.setReviewCount(progress.getReviewCount() + 1);
        progress.setLastReviewedAt(LocalDateTime.now());

        if (correct) {
            progress.setCorrectCount(progress.getCorrectCount() + 1);
            // SRS algorithm: increase interval
            double newEase = progress.getEaseFactor() + 0.1;
            progress.setEaseFactor(Math.min(newEase, 3.0));
            int newInterval = (int) (progress.getIntervalDays() * progress.getEaseFactor());
            progress.setIntervalDays(Math.min(newInterval, 180));
            progress.setMasteryLevel(Math.min(progress.getMasteryLevel() + 1, 5));
        } else {
            // Reset on incorrect
            double newEase = Math.max(progress.getEaseFactor() - 0.2, 1.3);
            progress.setEaseFactor(newEase);
            progress.setIntervalDays(1);
            progress.setMasteryLevel(Math.max(progress.getMasteryLevel() - 1, 0));
        }

        progress.setNextReviewAt(LocalDateTime.now().plusDays(progress.getIntervalDays()));
        return vocabProgressRepository.save(progress);
    }

    public List<VocabularyProgress> getUserVocabularyProgress(Long userId) {
        return vocabProgressRepository.findByUserId(userId);
    }

    public void seedVocabulariesForPathAsync(Long careerPathId) {
        CareerPath path = careerPathRepository.findById(careerPathId)
                .orElseThrow(() -> new ResourceNotFoundException("Career path not found"));

        CompletableFuture.runAsync(() -> {
            try {
                // Generate in 5 batches of 100 to get 500 words safely
                for (int i = 0; i < 5; i++) {
                    com.fasterxml.jackson.databind.JsonNode json = geminiService.generateCareerVocabulary(path.getName(), 100).orElse(null);
                    if (json != null && json.isArray()) {
                        for (com.fasterxml.jackson.databind.JsonNode node : json) {
                            try {
                                Vocabulary vocab = Vocabulary.builder()
                                        .careerPath(path)
                                        .word(node.path("word").asText())
                                        .phonetic(node.path("phonetic").asText())
                                        .partOfSpeech(node.path("partOfSpeech").asText())
                                        .definition(node.path("definition").asText())
                                        .meaningVi(node.path("meaningVi").asText())
                                        .exampleSentences(node.path("exampleSentences").toString())
                                        .difficulty(Scenario.Difficulty.INTERMEDIATE)
                                        .frequencyRank(i * 100)
                                        .build();
                                vocabularyRepository.save(vocab);
                            } catch (Exception e) {
                                // Skip individual failures
                            }
                        }
                    }
                    Thread.sleep(2000); // Wait between batches to respect rate limits
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    public void seedLessonsForPathAsync(Long careerPathId) {
        CareerPath path = careerPathRepository.findById(careerPathId)
                .orElseThrow(() -> new ResourceNotFoundException("Career path not found"));

        CompletableFuture.runAsync(() -> {
            try {
                String[] topics = {"Foundations", "Communication", "Technical Skills", "Workplace Culture", "Professional Growth"};
                for (int i = 0; i < topics.length; i++) {
                    com.fasterxml.jackson.databind.JsonNode json = geminiService.generateCareerLesson(path.getName(), topics[i]).orElse(null);
                    if (json != null) {
                        Lesson lesson = Lesson.builder()
                                .careerPath(path)
                                .title(json.path("title").asText(topics[i] + " Essentials"))
                                .lessonType(Lesson.LessonType.VOCABULARY)
                                .contentJson(json.toString())
                                .orderIndex(i + 1)
                                .estimatedMinutes(20)
                                .build();
                        lessonRepository.save(lesson);
                    }
                    Thread.sleep(2000);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }
}
