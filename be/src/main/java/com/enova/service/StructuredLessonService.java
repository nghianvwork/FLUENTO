package com.enova.service;

import com.enova.dto.request.StructuredLessonCompleteRequest;
import com.enova.dto.response.StructuredLevelResponse;
import com.enova.dto.response.StructuredLessonProgressResponse;
import com.enova.dto.response.StructuredLessonResponse;
import com.enova.exception.ResourceNotFoundException;
import com.enova.model.StructuredLesson;
import com.enova.model.StructuredLessonProgress;
import com.enova.model.User;
import com.enova.repository.StructuredLessonProgressRepository;
import com.enova.repository.StructuredLessonRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StructuredLessonService {

    private final StructuredLessonRepository lessonRepository;
    private final StructuredLessonProgressRepository progressRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    private static final List<LevelMeta> LEVELS = List.of(
            new LevelMeta("A1", "Beginner", "Basics of everyday English", 1),
            new LevelMeta("A2", "Elementary", "Common topics and routines", 2),
            new LevelMeta("B1", "Intermediate", "Work & travel communication", 3),
            new LevelMeta("B2", "Upper-Intermediate", "Complex ideas and opinions", 4),
            new LevelMeta("C1", "Advanced", "Fluent academic and professional English", 5),
            new LevelMeta("C2", "Proficient", "Near-native comprehension and style", 6)
    );

    public List<StructuredLevelResponse> getLevels(Long userId) {
        return LEVELS.stream()
                .map(level -> {
                    long total = lessonRepository.countByLevelCodeAndIsActiveTrue(level.code());
                    long completed = userId != null
                            ? progressRepository.countByUserIdAndLesson_LevelCodeAndStatus(
                            userId,
                            level.code(),
                            StructuredLessonProgress.ProgressStatus.COMPLETED)
                            : 0;
                    return StructuredLevelResponse.builder()
                            .code(level.code())
                            .title(level.title())
                            .description(level.description())
                            .orderIndex(level.orderIndex())
                            .totalLessons(total)
                            .completedLessons(completed)
                            .build();
                })
                .sorted(Comparator.comparingInt(StructuredLevelResponse::getOrderIndex))
                .toList();
    }

    public List<StructuredLessonResponse> getLessonsByLevel(String levelCode, Long userId) {
        List<StructuredLesson> lessons = lessonRepository
                .findByLevelCodeAndIsActiveTrueOrderByOrderIndexAsc(levelCode.toUpperCase());

        Map<Long, StructuredLessonProgress> progressMap = progressRepository
                .findByUserIdAndLesson_LevelCode(userId, levelCode.toUpperCase())
                .stream()
                .collect(Collectors.toMap(p -> p.getLesson().getId(), p -> p, (a, b) -> a));

        return lessons.stream()
                .map(lesson -> StructuredLessonResponse.from(lesson, progressMap.get(lesson.getId()), false))
                .toList();
    }

    public StructuredLessonResponse getLessonDetail(Long lessonId, Long userId) {
        StructuredLesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        StructuredLessonProgress progress = progressRepository.findByUserIdAndLessonId(userId, lessonId).orElse(null);
        return StructuredLessonResponse.from(lesson, progress, true);
    }

    @Transactional
    public StructuredLessonProgressResponse startLesson(Long lessonId, User user) {
        StructuredLesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));

        StructuredLessonProgress progress = progressRepository.findByUserIdAndLessonId(user.getId(), lessonId)
                .orElseGet(() -> StructuredLessonProgress.builder()
                        .lesson(lesson)
                        .user(user)
                        .status(StructuredLessonProgress.ProgressStatus.IN_PROGRESS)
                        .startedAt(LocalDateTime.now())
                        .build());

        if (progress.getStatus() == StructuredLessonProgress.ProgressStatus.NOT_STARTED) {
            progress.setStatus(StructuredLessonProgress.ProgressStatus.IN_PROGRESS);
            progress.setStartedAt(LocalDateTime.now());
        }

        return StructuredLessonProgressResponse.from(progressRepository.save(progress));
    }

    @Transactional
    public StructuredLessonProgressResponse completeLesson(Long lessonId, User user, StructuredLessonCompleteRequest request) {
        StructuredLessonProgress progress = progressRepository.findByUserIdAndLessonId(user.getId(), lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson progress not found"));

        progress.setStatus(StructuredLessonProgress.ProgressStatus.COMPLETED);
        progress.setScore(request.getScore());
        progress.setCompletedAt(LocalDateTime.now());
        return StructuredLessonProgressResponse.from(progressRepository.save(progress));
    }

    @Transactional
    public void seedLessonsForLevel(String levelCode) {
        String normalized = levelCode.toUpperCase();
        Optional<JsonNode> json = geminiService.generateStructuredLessons(normalized);
        List<JsonNode> lessonNodes = new ArrayList<>();
        json.ifPresent(node -> {
            if (node.isArray()) {
                node.forEach(lessonNodes::add);
            } else {
                lessonNodes.add(node);
            }
        });

        if (lessonNodes.isEmpty()) {
            lessonNodes.addAll(fallbackLessons(normalized));
        }

        int orderIndex = 0;
        for (JsonNode node : lessonNodes) {
            StructuredLesson lesson = StructuredLesson.builder()
                    .levelCode(normalized)
                    .title(node.path("title").asText("Lesson " + (orderIndex + 1)))
                    .description(node.path("description").asText(""))
                    .lessonType(parseLessonType(node.path("lessonType").asText("GRAMMAR")))
                    .contentJson(node.path("blocks").isMissingNode() ? "[]" : node.path("blocks").toString())
                    .orderIndex(orderIndex++)
                    .estimatedMinutes(node.path("estimatedMinutes").asInt(15))
                    .isActive(true)
                    .build();
            lessonRepository.save(lesson);
        }
    }

    private StructuredLesson.LessonType parseLessonType(String raw) {
        try {
            return StructuredLesson.LessonType.valueOf(raw.toUpperCase());
        } catch (Exception ex) {
            return StructuredLesson.LessonType.GRAMMAR;
        }
    }

    private List<JsonNode> fallbackLessons(String levelCode) {
        List<JsonNode> list = new ArrayList<>();
        try {
            String template = "[" +
                    "{\"title\":\"Daily Basics\",\"description\":\"Core phrases for "+levelCode+"\",\"lessonType\":\"VOCABULARY\",\"estimatedMinutes\":15,\"blocks\":[{" +
                    "\"type\":\"READING\",\"prompt\":\"Choose the correct greeting.\",\"options\":[\"Good morning\",\"Good night\"],\"answer\":\"Good morning\"},{" +
                    "\"type\":\"LISTENING\",\"prompt\":\"Type what you hear.\",\"answer\":\"Nice to meet you\",\"audioText\":\"Nice to meet you\"},{" +
                    "\"type\":\"WRITING\",\"prompt\":\"Write a short self-introduction.\",\"answer\":\"My name is...\"},{" +
                    "\"type\":\"SPEAKING\",\"prompt\":\"Say the sentence aloud.\",\"answer\":\"I am learning English.\"}]}" +
                    "]";
            JsonNode node = objectMapper.readTree(template);
            node.forEach(list::add);
        } catch (Exception ignored) {
        }
        return list;
    }

    private record LevelMeta(String code, String title, String description, int orderIndex) {}
}
