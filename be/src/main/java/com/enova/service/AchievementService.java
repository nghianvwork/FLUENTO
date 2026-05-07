package com.enova.service;

import com.enova.dto.response.AchievementResponse;
import com.enova.model.Achievement;
import com.enova.model.AchievementDefinition;
import com.enova.model.User;
import com.enova.model.UserProfile;
import com.enova.repository.AchievementDefinitionRepository;
import com.enova.repository.AchievementRepository;
import com.enova.repository.UserProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AchievementService {
    private final AchievementDefinitionRepository definitionRepository;
    private final AchievementRepository achievementRepository;
    private final UserProfileRepository userProfileRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<AchievementResponse> getUserAchievements(User user) {
        List<AchievementDefinition> definitions = definitionRepository.findAll();
        List<Achievement> earned = achievementRepository.findByUserIdOrderByEarnedAtDesc(user.getId());
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);

        Map<String, Achievement> earnedMap = earned.stream()
                .collect(Collectors.toMap(Achievement::getAchievementKey, a -> a));

        return definitions.stream().map(def -> {
            Achievement a = earnedMap.get(def.getAchievementKey());
            boolean isEarned = a != null;
            int progress = isEarned ? 100 : calculateProgress(def, profile);

            return AchievementResponse.builder()
                    .id(def.getId())
                    .achievementKey(def.getAchievementKey())
                    .title(def.getTitle())
                    .desc(def.getDescription())
                    .icon(def.getIcon())
                    .xpReward(def.getXpReward())
                    .progress(progress)
                    .isEarned(isEarned)
                    .earnedAt(isEarned ? a.getEarnedAt() : null)
                    .build();
        }).collect(Collectors.toList());
    }

    private int calculateProgress(AchievementDefinition def, UserProfile profile) {
        if (profile == null || def.getCriteriaJson() == null) return 0;
        
        try {
            JsonNode criteria = objectMapper.readTree(def.getCriteriaJson());
            String type = criteria.path("type").asText();
            int target = criteria.path("target").asInt(1);
            int current = 0;

            switch (type) {
                case "roleplay_count":
                    // Simple estimation since we don't track session count directly in UserProfile,
                    // we'll use totalRoleplayMinutes / 5 as an approximation or just return 0 if no stats
                    current = profile.getTotalRoleplayMinutes() > 0 ? 1 : 0;
                    break;
                case "streak":
                    current = profile.getStreakCount() != null ? profile.getStreakCount() : 0;
                    break;
                case "vocab_count":
                    current = profile.getTotalWordsLearned() != null ? profile.getTotalWordsLearned() : 0;
                    break;
                case "room_count":
                case "career_complete":
                case "report_count":
                case "pronunciation_score":
                    current = 0; // Requires complex repo queries, simplified for MVP
                    break;
                default:
                    current = 0;
            }

            int percent = (int) Math.min(100, Math.round((current * 100.0) / target));
            return percent;
        } catch (Exception e) {
            log.error("Failed to parse achievement criteria for {}", def.getAchievementKey(), e);
            return 0;
        }
    }
}
