package com.enova.service;

import com.enova.dto.request.ContentQuizAnswerRequest;
import com.enova.dto.response.ContentQuizResponse;
import com.enova.model.ContentQuiz;
import com.enova.model.ContentQuizAttempt;
import com.enova.model.User;
import com.enova.repository.ContentQuizAttemptRepository;
import com.enova.repository.ContentQuizRepository;
import com.enova.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentQuizService {
    private final ContentQuizRepository quizRepository;
    private final ContentQuizAttemptRepository attemptRepository;
    private final UserRepository userRepository;

    public List<ContentQuizResponse> getQuizzesByContent(Long contentId, Long userId) {
        List<ContentQuiz> quizzes = quizRepository.findByContentIdAndIsActiveTrueOrderByCreatedAtAsc(contentId);
        
        Map<Long, ContentQuizAttempt> attempts = attemptRepository.findByUserIdAndContentId(userId, contentId)
                .stream()
                .collect(Collectors.toMap(a -> a.getQuiz().getId(), a -> a, (a, b) -> b));

        return quizzes.stream().map(quiz -> {
            ContentQuizAttempt attempt = attempts.get(quiz.getId());
            return ContentQuizResponse.builder()
                    .id(quiz.getId())
                    .contentId(quiz.getContent().getId())
                    .question(quiz.getQuestion())
                    .optionA(quiz.getOptionA())
                    .optionB(quiz.getOptionB())
                    .optionC(quiz.getOptionC())
                    .optionD(quiz.getOptionD())
                    .correctAnswer(null)
                    .explanation(null)
                    .userAnswered(attempt != null)
                    .userCorrect(attempt != null ? attempt.getIsCorrect() : null)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public ContentQuizResponse submitAnswer(Long userId, ContentQuizAnswerRequest request) {
        ContentQuiz quiz = quizRepository.findById(request.getQuizId()).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();

        boolean isCorrect = quiz.getCorrectAnswer().equalsIgnoreCase(request.getAnswer());

        ContentQuizAttempt attempt = ContentQuizAttempt.builder()
                .quiz(quiz)
                .user(user)
                .userAnswer(request.getAnswer().toUpperCase())
                .isCorrect(isCorrect)
                .attemptedAt(LocalDateTime.now())
                .build();

        attemptRepository.save(attempt);

        return ContentQuizResponse.builder()
                .id(quiz.getId())
                .contentId(quiz.getContent().getId())
                .question(quiz.getQuestion())
                .optionA(quiz.getOptionA())
                .optionB(quiz.getOptionB())
                .optionC(quiz.getOptionC())
                .optionD(quiz.getOptionD())
                .correctAnswer(quiz.getCorrectAnswer())
                .explanation(quiz.getExplanation())
                .userAnswered(true)
                .userCorrect(isCorrect)
                .build();
    }
}
