package com.enova.service;

import com.enova.dto.request.RoleplayMessageRequest;
import com.enova.exception.ResourceNotFoundException;
import com.enova.model.*;
import com.enova.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RoleplayService {

    private final ScenarioRepository scenarioRepository;
    private final RoleplaySessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public List<Scenario> getActiveScenarios() {
        return scenarioRepository.findByIsActiveTrue();
    }

    public List<Scenario> getScenariosByCategory(Scenario.ScenarioCategory category) {
        return scenarioRepository.findByCategoryAndIsActiveTrue(category);
    }

    public Scenario getScenarioById(Long id) {
        return scenarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scenario not found"));
    }

    public List<Scenario> getAllScenarios() {
        return scenarioRepository.findAll();
    }

    public Scenario createScenario(Scenario scenario) {
        return scenarioRepository.save(scenario);
    }

    public Scenario updateScenario(Long id, Scenario update) {
        Scenario scenario = getScenarioById(id);

        if (update.getTitle() != null) scenario.setTitle(update.getTitle());
        if (update.getDescription() != null) scenario.setDescription(update.getDescription());
        if (update.getCategory() != null) scenario.setCategory(update.getCategory());
        if (update.getDifficulty() != null) scenario.setDifficulty(update.getDifficulty());
        if (update.getAiPersonality() != null) scenario.setAiPersonality(update.getAiPersonality());
        if (update.getContextPrompt() != null) scenario.setContextPrompt(update.getContextPrompt());
        if (update.getTags() != null) scenario.setTags(update.getTags());
        if (update.getIsActive() != null) scenario.setIsActive(update.getIsActive());

        return scenarioRepository.save(scenario);
    }

    public void deleteScenario(Long id) {
        scenarioRepository.deleteById(id);
    }

    @Transactional
    public RoleplaySession startSession(Long userId, Long scenarioId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Scenario scenario = getScenarioById(scenarioId);

        RoleplaySession session = RoleplaySession.builder()
                .user(user)
                .scenario(scenario)
                .conversationJson("[]")
                .errorsJson("[]")
                .status(RoleplaySession.SessionStatus.IN_PROGRESS)
                .build();

        return sessionRepository.save(session);
    }

    @Transactional
    public Map<String, Object> sendMessage(RoleplayMessageRequest request, Long userId) {
        RoleplaySession session;
        if (request.getSessionId() != null) {
            session = sessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        } else {
            session = startSession(userId, request.getScenarioId());
        }

        List<Map<String, String>> conversation = readConversation(session.getConversationJson());
        appendTurn(conversation, "user", request.getUserMessage());
        List<String> recentTurns = buildRecentTurns(conversation, 6);

        String aiResponse = geminiService
                .generateRoleplayResponse(session.getScenario(), request.getUserMessage(), recentTurns)
                .orElseGet(() -> generateAIResponse(session.getScenario(), request.getUserMessage()));
        appendTurn(conversation, "ai", aiResponse);
        session.setConversationJson(writeConversation(conversation));
        sessionRepository.save(session);
        List<String> errors = analyzeErrors(request.getUserMessage());

        Map<String, Object> result = new HashMap<>();
        result.put("sessionId", session.getId());
        result.put("aiResponse", aiResponse);
        result.put("errors", errors);
        result.put("tips", generateTips(errors));

        return result;
    }

    private List<Map<String, String>> readConversation(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<Map<String, String>>>() {});
        } catch (Exception ex) {
            return new ArrayList<>();
        }
    }

    private String writeConversation(List<Map<String, String>> conversation) {
        try {
            return objectMapper.writeValueAsString(conversation);
        } catch (Exception ex) {
            return "[]";
        }
    }

    private void appendTurn(List<Map<String, String>> conversation, String role, String content) {
        if (content == null) return;
        Map<String, String> entry = new HashMap<>();
        entry.put("role", role);
        entry.put("content", content);
        entry.put("time", LocalDateTime.now().toString());
        conversation.add(entry);
    }

    private List<String> buildRecentTurns(List<Map<String, String>> conversation, int limit) {
        List<String> recent = new ArrayList<>();
        int start = Math.max(0, conversation.size() - limit);
        for (int i = start; i < conversation.size(); i++) {
            Map<String, String> turn = conversation.get(i);
            String role = turn.getOrDefault("role", "user");
            String content = turn.getOrDefault("content", "");
            recent.add(role + ": " + content);
        }
        return recent;
    }

    @Transactional
    public RoleplaySession completeSession(Long sessionId) {
        RoleplaySession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        session.setStatus(RoleplaySession.SessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        session.setScore(calculateScore(session));
        session.setFeedbackSummary(generateFeedbackSummary(session));

        // Update user profile XP
        UserProfile profile = profileRepository.findByUserId(session.getUser().getId()).orElse(null);
        if (profile != null) {
            profile.setTotalXp(profile.getTotalXp() + session.getScore());
            profile.setTotalRoleplayMinutes(profile.getTotalRoleplayMinutes() + (session.getDurationSeconds() != null ? session.getDurationSeconds() / 60 : 5));
            profile.setLastStudyDate(LocalDateTime.now());
            profileRepository.save(profile);
        }

        return sessionRepository.save(session);
    }

    public List<RoleplaySession> getUserSessions(Long userId) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // --- AI Simulation Methods ---

    private String generateAIResponse(Scenario scenario, String userMessage) {
        Map<Scenario.ScenarioCategory, List<String>> responses = new HashMap<>();
        responses.put(Scenario.ScenarioCategory.INTERVIEW, Arrays.asList(
            "That's a great answer! Can you tell me more about a specific project where you demonstrated leadership?",
            "Interesting perspective. How would you handle a situation where you disagree with your team lead's approach?",
            "Thank you for sharing that. What would you say is your biggest professional achievement so far?",
            "I appreciate your honesty. Now, let me ask you about your experience with cross-functional teams.",
            "Good. Can you walk me through how you would approach solving a complex technical problem?"
        ));
        responses.put(Scenario.ScenarioCategory.MEETING, Arrays.asList(
            "That's a valid point. Should we also consider the timeline implications of this approach?",
            "I agree with your assessment. Let's discuss the resource allocation for this phase.",
            "Thanks for the update. Are there any blockers we should address before moving forward?",
            "Good progress! Let's set up a follow-up meeting to review the implementation details."
        ));
        responses.put(Scenario.ScenarioCategory.PRESENTATION, Arrays.asList(
            "Impressive data! Could you elaborate on how these metrics compare to last quarter?",
            "That's a compelling argument. What's the expected ROI for this initiative?",
            "I have a question about the implementation timeline. Is that realistic given our current resources?"
        ));

        List<String> categoryResponses = responses.getOrDefault(scenario.getCategory(),
            Arrays.asList(
                "That's an interesting point. Could you elaborate on that?",
                "I understand. How would you handle this differently next time?",
                "Thank you for sharing. Let's move on to the next topic.",
                "Great response! You're making excellent progress."
            ));

        String base = categoryResponses.get(new Random().nextInt(categoryResponses.size()));
        if (userMessage == null || userMessage.isBlank()) return base;
        String hook = userMessage.length() > 60 ? userMessage.substring(0, 60) + "..." : userMessage;
        return "You said: \"" + hook + "\". " + base;
    }

    private List<String> analyzeErrors(String message) {
        List<String> errors = new ArrayList<>();
        if (message != null && !message.isEmpty()) {
            if (message.length() < 20) {
                errors.add("Try to provide more detailed responses to demonstrate your communication skills.");
            }
            if (!message.substring(0, 1).equals(message.substring(0, 1).toUpperCase())) {
                errors.add("Remember to capitalize the first letter of your sentences.");
            }
            if (!message.endsWith(".") && !message.endsWith("?") && !message.endsWith("!")) {
                errors.add("Don't forget proper punctuation at the end of your sentences.");
            }
        }
        return errors;
    }

    private List<String> generateTips(List<String> errors) {
        List<String> tips = new ArrayList<>();
        if (errors.isEmpty()) {
            tips.add("Excellent! Your response was well-structured.");
            tips.add("Keep using professional vocabulary in your answers.");
        } else {
            tips.add("Focus on expanding your answers with specific examples.");
            tips.add("Practice using transition words like 'furthermore', 'moreover', 'in addition'.");
        }
        return tips;
    }

    private int calculateScore(RoleplaySession session) {
        return 70 + new Random().nextInt(30); // 70-100 score simulation
    }

    private String generateFeedbackSummary(RoleplaySession session) {
        return "Good session! You demonstrated clear communication skills. " +
               "Areas to improve: Use more professional vocabulary and provide specific examples. " +
               "Strength: Good sentence structure and logical flow of ideas.";
    }
}
