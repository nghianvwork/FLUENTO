package com.enova.service;

import com.enova.dto.request.AdminTestQuestionRequest;
import com.enova.dto.request.AdminTestRequest;
import com.enova.dto.request.ContentTestAnswerRequest;
import com.enova.dto.response.ContentTestAttemptResponse;
import com.enova.dto.response.ContentTestQuestionResponse;
import com.enova.dto.response.ContentTestResponse;
import com.enova.exception.ResourceNotFoundException;
import com.enova.model.*;
import com.enova.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentTestService {
    private final ContentTestRepository testRepository;
    private final ContentTestQuestionRepository questionRepository;
    private final ContentTestAttemptRepository attemptRepository;
    private final UserRepository userRepository;
    private final ContentItemRepository contentItemRepository;
    private final ObjectMapper objectMapper;

    public List<ContentTestResponse> getTestsByContent(Long contentId) {
        return testRepository.findByContentIdAndIsActiveTrue(contentId)
                .stream()
                .map(test -> {
                    List<ContentTestQuestionResponse> questions = questionRepository
                            .findByTestIdOrderByOrderIndexAsc(test.getId())
                            .stream()
                            .map(ContentTestQuestionResponse::from)
                            .collect(Collectors.toList());
                    return ContentTestResponse.from(test, questions);
                })
                .collect(Collectors.toList());
    }

    public ContentTestResponse getTestById(Long testId) {
        ContentTest test = testRepository.findByIdAndIsActiveTrue(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found"));

        List<ContentTestQuestionResponse> questions = questionRepository
                .findByTestIdOrderByOrderIndexAsc(testId)
                .stream()
                .map(ContentTestQuestionResponse::from)
                .collect(Collectors.toList());

        return ContentTestResponse.from(test, questions);
    }

    @Transactional
    public ContentTestAttemptResponse submitTest(Long testId, Long userId, ContentTestAnswerRequest request) {
        ContentTest test = testRepository.findByIdAndIsActiveTrue(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<ContentTestQuestion> questions = questionRepository.findByTestIdOrderByOrderIndexAsc(testId);
        
        int correctAnswers = 0;
        int totalPoints = 0;
        int earnedPoints = 0;

        for (ContentTestQuestion question : questions) {
            totalPoints += question.getPoints();
            String userAnswer = request.getAnswers().get(question.getId());
            if (userAnswer != null && userAnswer.trim().equalsIgnoreCase(question.getCorrectAnswer().trim())) {
                correctAnswers++;
                earnedPoints += question.getPoints();
            }
        }

        int score = totalPoints > 0 ? (earnedPoints * 100) / totalPoints : 0;
        boolean passed = score >= test.getPassingScore();

        String answersJson;
        try {
            answersJson = objectMapper.writeValueAsString(request.getAnswers());
        } catch (JsonProcessingException e) {
            answersJson = "{}";
        }

        ContentTestAttempt attempt = ContentTestAttempt.builder()
                .test(test)
                .user(user)
                .score(score)
                .totalQuestions(questions.size())
                .correctAnswers(correctAnswers)
                .timeSpent(request.getTimeSpent())
                .passed(passed)
                .answers(answersJson)
                .build();

        attempt = attemptRepository.save(attempt);
        return ContentTestAttemptResponse.from(attempt);
    }

    public List<ContentTestAttemptResponse> getTestAttempts(Long testId, Long userId) {
        return attemptRepository.findByTestIdAndUserIdOrderByCreatedAtDesc(testId, userId)
                .stream()
                .map(ContentTestAttemptResponse::from)
                .collect(Collectors.toList());
    }

    public List<ContentTestAttemptResponse> getUserTestAttempts(Long userId) {
        return attemptRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ContentTestAttemptResponse::from)
                .collect(Collectors.toList());
    }

    public List<ContentTestResponse> getAllTests() {
        return testRepository.findAll()
                .stream()
                .map(test -> {
                    List<ContentTestQuestionResponse> questions = questionRepository
                            .findByTestIdOrderByOrderIndexAsc(test.getId())
                            .stream()
                            .map(ContentTestQuestionResponse::from)
                            .collect(Collectors.toList());
                    return ContentTestResponse.from(test, questions);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ContentTestResponse createTest(AdminTestRequest request) {
        ContentItem content = contentItemRepository.findById(request.getContentId())
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));

        ContentTest test = ContentTest.builder()
                .content(content)
                .title(request.getTitle() != null ? request.getTitle() : "Untitled Test")
                .description(request.getDescription())
                .type(request.getType() != null ? ContentTest.TestType.valueOf(request.getType()) : ContentTest.TestType.MULTIPLE_CHOICE)
                .timeLimit(request.getTimeLimit() != null ? request.getTimeLimit() : 30)
                .passingScore(request.getPassingScore() != null ? request.getPassingScore() : 70)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        
        test = testRepository.save(test);

        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            for (AdminTestQuestionRequest qReq : request.getQuestions()) {
                ContentTestQuestion q = ContentTestQuestion.builder()
                        .test(test)
                        .question(qReq.getQuestion())
                        .options(qReq.getOptions())
                        .correctAnswer(qReq.getCorrectAnswer())
                        .explanation(qReq.getExplanation())
                        .points(qReq.getPoints() != null ? qReq.getPoints() : 1)
                        .orderIndex(qReq.getOrderIndex() != null ? qReq.getOrderIndex() : 0)
                        .build();
                questionRepository.save(q);
            }
        }

        return getTestResponse(test);
    }

    @Transactional
    public ContentTestResponse updateTest(Long testId, AdminTestRequest request) {
        ContentTest test = testRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found"));

        if (request.getContentId() != null) {
            ContentItem content = contentItemRepository.findById(request.getContentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Content not found"));
            test.setContent(content);
        }
        if (request.getTitle() != null) test.setTitle(request.getTitle());
        if (request.getDescription() != null) test.setDescription(request.getDescription());
        if (request.getType() != null) test.setType(ContentTest.TestType.valueOf(request.getType()));
        if (request.getTimeLimit() != null) test.setTimeLimit(request.getTimeLimit());
        if (request.getPassingScore() != null) test.setPassingScore(request.getPassingScore());
        if (request.getIsActive() != null) test.setIsActive(request.getIsActive());

        test = testRepository.save(test);

        // Update questions
        if (request.getQuestions() != null) {
            List<ContentTestQuestion> existingQuestions = questionRepository.findByTestIdOrderByOrderIndexAsc(testId);
            questionRepository.deleteAll(existingQuestions);

            for (AdminTestQuestionRequest qReq : request.getQuestions()) {
                ContentTestQuestion q = ContentTestQuestion.builder()
                        .test(test)
                        .question(qReq.getQuestion())
                        .options(qReq.getOptions())
                        .correctAnswer(qReq.getCorrectAnswer())
                        .explanation(qReq.getExplanation())
                        .points(qReq.getPoints() != null ? qReq.getPoints() : 1)
                        .orderIndex(qReq.getOrderIndex() != null ? qReq.getOrderIndex() : 0)
                        .build();
                questionRepository.save(q);
            }
        }

        return getTestResponse(test);
    }

    private ContentTestResponse getTestResponse(ContentTest test) {
        List<ContentTestQuestionResponse> questions = questionRepository
                .findByTestIdOrderByOrderIndexAsc(test.getId())
                .stream()
                .map(ContentTestQuestionResponse::from)
                .collect(Collectors.toList());
        return ContentTestResponse.from(test, questions);
    }

    @Transactional
    public void deleteTest(Long testId) {
        testRepository.deleteById(testId);
    }
}
