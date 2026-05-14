package com.enova.service;

import com.enova.dto.request.ContentQuizAnswerRequest;
import com.enova.dto.response.ContentQuizResponse;
import com.enova.model.ContentQuiz;
import com.enova.model.ContentQuizAttempt;
import com.enova.model.User;
import com.enova.repository.ContentQuizAttemptRepository;
import com.enova.repository.ContentQuizRepository;
import com.enova.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper;

    public List<ContentQuizResponse> getQuizzesByContent(Long contentId, Long userId) {
        List<ContentQuiz> quizzes = quizRepository.findByContentIdAndIsActiveTrueOrderByCreatedAtAsc(contentId);
        
        Map<Long, ContentQuizAttempt> attempts = attemptRepository.findByUserIdAndContentId(userId, contentId)
                .stream()
                .collect(Collectors.toMap(a -> a.getQuiz().getId(), a -> a, (a, b) -> b));

        return quizzes.stream().map(quiz -> {
            ContentQuizAttempt attempt = attempts.get(quiz.getId());
            String type = quiz.getQuestionType() != null
                    ? quiz.getQuestionType().name()
                    : ContentQuiz.QuestionType.MULTIPLE_CHOICE.name();
            return ContentQuizResponse.builder()
                    .id(quiz.getId())
                    .contentId(quiz.getContent().getId())
                    .question(quiz.getQuestion())
                    .questionType(type)
                    .optionA(quiz.getOptionA())
                    .optionB(quiz.getOptionB())
                    .optionC(quiz.getOptionC())
                    .optionD(quiz.getOptionD())
                    .optionsJson(quiz.getOptionsJson())
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

        boolean isCorrect = isAnswerCorrect(quiz, request.getAnswer());

        ContentQuizAttempt attempt = ContentQuizAttempt.builder()
                .quiz(quiz)
                .user(user)
            .userAnswer(request.getAnswer())
                .isCorrect(isCorrect)
                .attemptedAt(LocalDateTime.now())
                .build();

        attemptRepository.save(attempt);

        return ContentQuizResponse.builder()
                .id(quiz.getId())
                .contentId(quiz.getContent().getId())
                .question(quiz.getQuestion())
                .questionType(quiz.getQuestionType() != null
                        ? quiz.getQuestionType().name()
                        : ContentQuiz.QuestionType.MULTIPLE_CHOICE.name())
                .optionA(quiz.getOptionA())
                .optionB(quiz.getOptionB())
                .optionC(quiz.getOptionC())
                .optionD(quiz.getOptionD())
                .optionsJson(quiz.getOptionsJson())
                .correctAnswer(quiz.getCorrectAnswer())
                .explanation(quiz.getExplanation())
                .userAnswered(true)
                .userCorrect(isCorrect)
                .build();
    }

    private boolean isAnswerCorrect(ContentQuiz quiz, String userAnswer) {
        if (userAnswer == null || quiz.getCorrectAnswer() == null) return false;
        ContentQuiz.QuestionType type = quiz.getQuestionType() != null
                ? quiz.getQuestionType()
                : ContentQuiz.QuestionType.MULTIPLE_CHOICE;

        return switch (type) {
            case MULTIPLE_CHOICE -> normalize(userAnswer).equalsIgnoreCase(normalize(quiz.getCorrectAnswer()));
            case FILL_BLANK -> normalize(userAnswer).equalsIgnoreCase(normalize(quiz.getCorrectAnswer()));
            case SENTENCE_ORDER -> compareJsonArray(userAnswer, quiz.getCorrectAnswer());
        };
    }

    private boolean compareJsonArray(String userAnswer, String correctAnswer) {
        try {
            List<?> user = objectMapper.readValue(userAnswer, List.class);
            List<?> correct = objectMapper.readValue(correctAnswer, List.class);
            if (user.size() != correct.size()) return false;
            for (int i = 0; i < user.size(); i++) {
                String u = String.valueOf(user.get(i));
                String c = String.valueOf(correct.get(i));
                if (!normalize(u).equalsIgnoreCase(normalize(c))) return false;
            }
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    private String normalize(String text) {
        if (text == null) return "";
        return text.trim().toLowerCase();
    }
}
