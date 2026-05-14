package com.enova.service;

import com.enova.dto.response.ContentAiSummaryResponse;
import com.enova.model.ContentItem;
import com.enova.model.ContentQuiz;
import com.enova.model.ContentTest;
import com.enova.model.ContentTestQuestion;
import com.enova.repository.ContentQuizRepository;
import com.enova.repository.ContentTestQuestionRepository;
import com.enova.repository.ContentTestRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContentAiService {

    private final ContentService contentService;
    private final GeminiService geminiService;
    private final ContentQuizRepository quizRepository;
    private final ContentTestRepository testRepository;
    private final ContentTestQuestionRepository testQuestionRepository;
    private final ObjectMapper objectMapper;

    public ContentAiSummaryResponse summarize(Long contentId, String focus) {
        ContentItem item = contentService.getContentById(contentId);
        var json = geminiService.generateContentSummary(item.getTitle(), item.getSummary(), focus).orElse(null);
        if (json == null) {
            return ContentAiSummaryResponse.builder()
                    .contentId(contentId)
                    .summary(item.getSummary() != null ? item.getSummary() : "Summary unavailable")
                    .keyVocabulary(List.of())
                    .discussionQuestions(List.of())
                    .build();
        }
        List<String> vocab = JsonArrayReader.read(json.path("keyVocabulary"));
        List<String> questions = JsonArrayReader.read(json.path("discussionQuestions"));

        return ContentAiSummaryResponse.builder()
                .contentId(contentId)
                .summary(json.path("summary").asText(""))
                .keyVocabulary(vocab)
                .discussionQuestions(questions)
                .build();
    }

    public void generateQuizzes(Long contentId) {
        ContentItem item = contentService.getContentById(contentId);
        var json = geminiService.generateContentQuizzes(item.getTitle(), item.getSummary()).orElse(null);

        if (json != null && json.isArray()) {
            json.forEach(q -> {
                String optionA = q.path("optionA").asText();
                String optionB = q.path("optionB").asText();
                String optionC = q.path("optionC").asText();
                String optionD = q.path("optionD").asText();
                String optionsJson;
                try {
                    optionsJson = objectMapper.writeValueAsString(List.of(optionA, optionB, optionC, optionD));
                } catch (Exception ex) {
                    optionsJson = "[]";
                }
                ContentQuiz quiz = ContentQuiz.builder()
                        .content(item)
                        .questionType(ContentQuiz.QuestionType.MULTIPLE_CHOICE)
                        .question(q.path("question").asText())
                        .optionA(optionA)
                        .optionB(optionB)
                        .optionC(optionC)
                        .optionD(optionD)
                        .optionsJson(optionsJson)
                        .correctAnswer(q.path("correctAnswer").asText())
                        .explanation(q.path("explanation").asText())
                        .isActive(true)
                        .build();
                quizRepository.save(quiz);
            });
        }
    }

    public void generateMixedQuizzes(Long contentId) {
        ContentItem item = contentService.getContentById(contentId);
        var json = geminiService.generateContentMixedQuizzes(item.getTitle(), item.getSummary()).orElse(null);

        if (json != null && json.isArray()) {
            json.forEach(q -> {
                String type = q.path("questionType").asText("MULTIPLE_CHOICE");
                String optionsJson = q.path("options").isMissingNode() ? "[]" : q.path("options").toString();
                String correct = q.path("correctAnswer").isMissingNode()
                        ? ""
                        : q.path("correctAnswer").isArray()
                        ? q.path("correctAnswer").toString()
                        : q.path("correctAnswer").asText();

                ContentQuiz.QuestionType quizType;
                try {
                    quizType = ContentQuiz.QuestionType.valueOf(type);
                } catch (Exception ex) {
                    quizType = ContentQuiz.QuestionType.MULTIPLE_CHOICE;
                }

                ContentQuiz quiz = ContentQuiz.builder()
                        .content(item)
                        .questionType(quizType)
                        .question(q.path("question").asText())
                        .optionA(q.path("optionA").asText(""))
                        .optionB(q.path("optionB").asText(""))
                        .optionC(q.path("optionC").asText(""))
                        .optionD(q.path("optionD").asText(""))
                        .optionsJson(optionsJson)
                        .correctAnswer(correct)
                        .explanation(q.path("explanation").asText())
                        .isActive(true)
                        .build();
                quizRepository.save(quiz);
            });
        }
    }

    public void seedTests(Long contentId) {
        ContentItem item = contentService.getContentById(contentId);
        var json = geminiService.generateContentTests(item.getTitle(), item.getSummary()).orElse(null);
        if (json == null || !json.has("questions")) return;

        ContentTest test = ContentTest.builder()
                .content(item)
                .title(json.path("title").asText(item.getTitle() + " Test"))
                .description(json.path("description").asText(""))
                .type(ContentTest.TestType.MIXED)
                .timeLimit(json.path("timeLimit").asInt(20))
                .passingScore(json.path("passingScore").asInt(70))
                .isActive(true)
                .build();
        test = testRepository.save(test);

        int orderIndex = 0;
        for (var q : json.path("questions")) {
            String type = q.path("questionType").asText("MULTIPLE_CHOICE");
            String options = q.path("options").isMissingNode() ? "[]" : q.path("options").toString();
            String correct = q.path("correctAnswer").isMissingNode()
                    ? ""
                    : q.path("correctAnswer").isArray()
                    ? q.path("correctAnswer").toString()
                    : q.path("correctAnswer").asText();

            ContentTestQuestion.QuestionType questionType;
            try {
                questionType = ContentTestQuestion.QuestionType.valueOf(type);
            } catch (Exception ex) {
                questionType = ContentTestQuestion.QuestionType.MULTIPLE_CHOICE;
            }

            ContentTestQuestion question = ContentTestQuestion.builder()
                    .test(test)
                    .question(q.path("question").asText())
                    .questionType(questionType)
                    .options(options)
                    .correctAnswer(correct)
                    .explanation(q.path("explanation").asText(""))
                    .points(q.path("points").asInt(1))
                    .orderIndex(orderIndex++)
                    .build();
            testQuestionRepository.save(question);
        }
    }

        private static class JsonArrayReader {
                static List<String> read(com.fasterxml.jackson.databind.JsonNode node) {
                        if (node == null || !node.isArray()) return List.of();
                        List<String> values = new java.util.ArrayList<>();
                        node.forEach(n -> values.add(n.asText()));
                        return values;
                }
        }
}
