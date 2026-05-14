package com.enova.service;

import com.enova.exception.ResourceNotFoundException;
import com.enova.model.Exam;
import com.enova.model.ExamAttempt;
import com.enova.model.ExamQuestion;
import com.enova.model.User;
import com.enova.repository.ExamAttemptRepository;
import com.enova.repository.ExamQuestionRepository;
import com.enova.repository.ExamRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExamService {
    private final ExamRepository examRepository;
    private final ExamQuestionRepository questionRepository;
    private final ExamAttemptRepository attemptRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public List<Exam> getAvailableExams() {
        return examRepository.findByIsActiveTrue();
    }

    public List<Exam> getExamsByType(Exam.ExamType type) {
        return examRepository.findByTypeAndIsActiveTrue(type);
    }

    public Exam getExam(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
    }

    @Transactional
    public Exam seedExam(String type, String section, String level) {
        log.info("Seeding exam for type: {}, section: {}, level: {}", type, section, level);
        
        JsonNode data = geminiService.generateExamQuestions(type, section, level)
                .orElseThrow(() -> new RuntimeException("Failed to generate exam content from Gemini"));

        Exam.ExamType examType;
        try {
            examType = Exam.ExamType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.error("Invalid exam type: {}", type);
            throw new RuntimeException("Invalid exam type: " + type);
        }

        Exam exam = Exam.builder()
                .title(data.path("title").asText("New " + type + " Practice Test"))
                .description(data.path("description").asText("Generated practice test for " + type))
                .type(examType)
                .level(level != null ? level : data.path("level").asText("Intermediate"))
                .durationMinutes(data.path("durationMinutes").asInt(60))
                .isActive(true)
                .build();

        Exam saved = examRepository.save(exam);
        List<ExamQuestion> questions = new ArrayList<>();
        JsonNode questionsNode = data.path("questions");
        
        if (questionsNode.isArray()) {
            questionsNode.forEach(qNode -> {
                try {
                    String sectionStr = qNode.path("section").asText("GRAMMAR").toUpperCase();
                    ExamQuestion.Section sectionEnum;
                    try {
                        sectionEnum = ExamQuestion.Section.valueOf(sectionStr);
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid section '{}' in question, defaulting to GRAMMAR", sectionStr);
                        sectionEnum = ExamQuestion.Section.GRAMMAR;
                    }

                    ExamQuestion q = ExamQuestion.builder()
                            .exam(saved)
                            .questionText(qNode.path("questionText").asText("Untitled Question"))
                            .optionsJson(objectMapper.writeValueAsString(qNode.path("options")))
                            .correctAnswer(qNode.path("correctAnswer").asText(""))
                            .explanation(qNode.path("explanation").asText(""))
                            .section(sectionEnum)
                            .points(1)
                            .build();
                    questions.add(q);
                } catch (Exception e) {
                    log.error("Error parsing question node: {}", qNode, e);
                }
            });
        }

        if (questions.isEmpty()) {
            log.error("No valid questions were generated for exam: {}", type);
            throw new RuntimeException("Gemini returned no valid questions");
        }

        questionRepository.saveAll(questions);
        saved.setTotalQuestions(questions.size());
        Exam finalExam = examRepository.save(saved);
        log.info("Successfully seeded exam with {} questions", questions.size());
        return finalExam;
    }

    @Transactional
    public ExamAttempt submitAttempt(User user, Long examId, Integer score, Integer total, Integer timeSpent, String answersJson) {
        Exam exam = getExam(examId);
        ExamAttempt attempt = ExamAttempt.builder()
                .user(user)
                .exam(exam)
                .score(score)
                .totalPossible(total)
                .timeSpentSeconds(timeSpent)
                .answersJson(answersJson)
                .build();
        return attemptRepository.save(attempt);
    }

    public List<ExamAttempt> getUserAttempts(Long userId) {
        return attemptRepository.findByUserIdOrderByCompletedAtDesc(userId);
    }
}
