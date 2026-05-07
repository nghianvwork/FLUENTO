package com.enova.service;

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
}
