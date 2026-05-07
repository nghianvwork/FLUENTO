package com.enova.service;

import com.enova.dto.response.ChallengeResponse;
import com.enova.model.Challenge;
import com.enova.model.User;
import com.enova.model.UserChallengeProgress;
import com.enova.model.UserProfile;
import com.enova.repository.ChallengeRepository;
import com.enova.repository.UserChallengeProgressRepository;
import com.enova.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChallengeService {
    private final ChallengeRepository challengeRepository;
    private final UserChallengeProgressRepository progressRepository;
    private final UserProfileRepository userProfileRepository;

    @PostConstruct
    public void seedData() {
        if (challengeRepository.count() == 0) {
            challengeRepository.save(Challenge.builder()
                    .title("7-Day Speaking Sprint")
                    .description("Join any speaking room daily")
                    .challengeType("WEEKLY")
                    .metricType("ROOM")
                    .goal(7)
                    .reward("500 XP")
                    .icon("🎙️")
                    .build());
            challengeRepository.save(Challenge.builder()
                    .title("Roleplay Mastery")
                    .description("Finish 5 roleplay sessions")
                    .challengeType("WEEKLY")
                    .metricType("ROLEPLAY")
                    .goal(5)
                    .reward("AI Coach Boost")
                    .icon("🎭")
                    .build());
            challengeRepository.save(Challenge.builder()
                    .title("Shadow 3 sentences")
                    .description("Complete pronunciation exercises")
                    .challengeType("DAILY")
                    .metricType("PRONUNCIATION")
                    .goal(3)
                    .reward("+80 XP")
                    .icon("🗣️")
                    .build());
            challengeRepository.save(Challenge.builder()
                    .title("Vocabulary Heatwave")
                    .description("Learn 10 new words")
                    .challengeType("DAILY")
                    .metricType("VOCAB")
                    .goal(10)
                    .reward("+50 XP")
                    .icon("📚")
                    .build());
        }
    }

    @Transactional(readOnly = true)
    public List<ChallengeResponse> getActiveChallenges(User user) {
        List<Challenge> challenges = challengeRepository.findByIsActiveTrue();
        List<UserChallengeProgress> progressList = progressRepository.findByUserId(user.getId());
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);

        Map<Long, UserChallengeProgress> progressMap = progressList.stream()
                .collect(Collectors.toMap(p -> p.getChallenge().getId(), p -> p));

        return challenges.stream().map(c -> {
            UserChallengeProgress p = progressMap.get(c.getId());
            int currentProgress = p != null ? p.getCurrentProgress() : calculateEstimatedProgress(c, profile);
            boolean isClaimed = p != null && p.getIsClaimed();

            return ChallengeResponse.builder()
                    .id(c.getId())
                    .title(c.getTitle())
                    .desc(c.getDescription())
                    .type(c.getChallengeType())
                    .progress(Math.min(currentProgress, c.getGoal()))
                    .goal(c.getGoal())
                    .reward(c.getReward())
                    .icon(c.getIcon())
                    .isClaimed(isClaimed)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public boolean claimReward(User user, Long challengeId) {
        UserChallengeProgress progress = progressRepository.findByUserIdAndChallengeId(user.getId(), challengeId)
                .orElseGet(() -> {
                    Challenge c = challengeRepository.findById(challengeId)
                            .orElseThrow(() -> new RuntimeException("Challenge not found"));
                    UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
                    return UserChallengeProgress.builder()
                            .user(user)
                            .challenge(c)
                            .currentProgress(calculateEstimatedProgress(c, profile))
                            .periodStart(LocalDateTime.now())
                            .periodEnd(LocalDateTime.now().plusDays(7))
                            .build();
                });

        if (progress.getIsClaimed()) return false;
        
        if (progress.getCurrentProgress() >= progress.getChallenge().getGoal()) {
            progress.setIsClaimed(true);
            progressRepository.save(progress);
            
            // Add XP to user profile
            UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
            if (profile != null && progress.getChallenge().getReward().contains("XP")) {
                try {
                    int xp = Integer.parseInt(progress.getChallenge().getReward().replaceAll("[^0-9]", ""));
                    profile.setTotalXp(profile.getTotalXp() + xp);
                    userProfileRepository.save(profile);
                } catch (Exception e) {
                    log.error("Failed to parse XP reward", e);
                }
            }
            return true;
        }
        return false;
    }

    private int calculateEstimatedProgress(Challenge c, UserProfile profile) {
        if (profile == null) return 0;
        if ("ROLEPLAY".equals(c.getMetricType())) {
            return profile.getTotalRoleplayMinutes() > 0 ? 1 : 0; // Simplified
        } else if ("VOCAB".equals(c.getMetricType())) {
            return profile.getTotalWordsLearned() != null ? profile.getTotalWordsLearned() : 0;
        } else if ("STREAK".equals(c.getMetricType())) {
            return profile.getStreakCount() != null ? profile.getStreakCount() : 0;
        }
        return 0;
    }
}
