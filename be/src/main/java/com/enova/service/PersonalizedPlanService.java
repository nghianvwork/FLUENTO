package com.enova.service;

import com.enova.dto.request.PersonalizedPlanRequest;
import com.enova.dto.response.PersonalizedPlanResponse;
import com.enova.model.PersonalizedPlan;
import com.enova.model.User;
import com.enova.model.UserProfile;
import com.enova.repository.PersonalizedPlanRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PersonalizedPlanService {

    private final PersonalizedPlanRepository planRepository;
    private final UserService userService;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public Optional<PersonalizedPlanResponse> getActivePlan(Long userId) {
        return planRepository.findFirstByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId)
                .map(this::toResponse);
    }

    public PersonalizedPlanResponse generatePlan(Long userId, PersonalizedPlanRequest request) {
        UserProfile profile = userService.getProfile(userId);
        String cefrLevel = profile.getCefrLevel().name();
        String targetLevel = profile.getTargetLevel() != null ? profile.getTargetLevel().name() : cefrLevel;
        int dailyGoal = request.getDailyGoalMinutes() != null
                ? request.getDailyGoalMinutes()
                : profile.getDailyGoalMinutes();

        JsonNode plan = geminiService.generatePersonalizedPlan(
                profile.getDisplayName(),
                profile.getCareerIndustry(),
                profile.getCareerGoal(),
                cefrLevel,
                targetLevel,
                dailyGoal,
                request.getFocus()
        ).orElse(null);

        String planJson;
        String title = "Personalized Study Plan";
        String summary = "";
        try {
            planJson = plan != null ? objectMapper.writeValueAsString(plan) : "{}";
            if (plan != null) {
                title = plan.path("title").asText(title);
                summary = plan.path("summary").asText("");
            }
        } catch (Exception ex) {
            planJson = "{}";
        }

        User user = userService.getUserById(userId);

        PersonalizedPlan entity = PersonalizedPlan.builder()
            .user(user)
                .title(title)
                .summary(summary)
                .cefrLevel(cefrLevel)
                .targetLevel(targetLevel)
                .dailyGoalMinutes(dailyGoal)
                .planJson(planJson)
                .isActive(true)
                .build();

        return toResponse(planRepository.save(entity));
    }

    private PersonalizedPlanResponse toResponse(PersonalizedPlan plan) {
        return PersonalizedPlanResponse.builder()
                .id(plan.getId())
                .title(plan.getTitle())
                .summary(plan.getSummary())
                .cefrLevel(plan.getCefrLevel())
                .targetLevel(plan.getTargetLevel())
                .dailyGoalMinutes(plan.getDailyGoalMinutes())
                .planJson(plan.getPlanJson())
                .isActive(plan.getIsActive())
                .createdAt(plan.getCreatedAt())
                .build();
    }
}
