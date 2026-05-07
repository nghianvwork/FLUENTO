package com.enova.service;

import com.enova.dto.request.ProfileUpdateRequest;
import com.enova.dto.request.AdminUserCreateRequest;
import com.enova.dto.request.AdminUserUpdateRequest;
import com.enova.dto.response.DashboardResponse;
import com.enova.exception.ResourceNotFoundException;
import com.enova.model.User;
import com.enova.model.UserProfile;
import com.enova.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final VocabularyProgressRepository vocabProgressRepository;
    private final RoleplaySessionRepository roleplaySessionRepository;
    private final PasswordEncoder passwordEncoder;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserProfile getProfile(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
    }

    public Integer getTotalXp(Long userId) {
        return profileRepository.findByUserId(userId)
                .map(UserProfile::getTotalXp)
                .orElse(0);
    }

    @Transactional
    public UserProfile updateProfile(Long userId, ProfileUpdateRequest request) {
        UserProfile profile = getProfile(userId);

        if (request.getDisplayName() != null) profile.setDisplayName(request.getDisplayName());
        if (request.getNativeLanguage() != null) profile.setNativeLanguage(request.getNativeLanguage());
        if (request.getCefrLevel() != null) profile.setCefrLevel(UserProfile.CefrLevel.valueOf(request.getCefrLevel()));
        if (request.getTargetLevel() != null) profile.setTargetLevel(UserProfile.CefrLevel.valueOf(request.getTargetLevel()));
        if (request.getDailyGoalMinutes() != null) profile.setDailyGoalMinutes(request.getDailyGoalMinutes());
        if (request.getPreferredAccent() != null) profile.setPreferredAccent(UserProfile.AccentPreference.valueOf(request.getPreferredAccent()));
        if (request.getCareerIndustry() != null) profile.setCareerIndustry(request.getCareerIndustry());
        if (request.getCareerGoal() != null) profile.setCareerGoal(request.getCareerGoal());

        return profileRepository.save(profile);
    }

    public DashboardResponse getDashboard(Long userId) {
        UserProfile profile = getProfile(userId);
        long completedLessons = lessonProgressRepository.countByUserIdAndStatus(
                userId, com.enova.model.LessonProgress.ProgressStatus.COMPLETED);
        long wordsLearned = vocabProgressRepository.countByUserIdAndMasteryLevelGreaterThan(userId, 0);

        return DashboardResponse.builder()
                .streakCount(profile.getStreakCount())
                .totalXp(profile.getTotalXp())
                .wordsLearned((int) wordsLearned)
                .lessonsCompleted((int) completedLessons)
                .roleplayMinutes(profile.getTotalRoleplayMinutes())
                .cefrLevel(profile.getCefrLevel().name())
                .dailyGoalMinutes(profile.getDailyGoalMinutes())
                .todayMinutes(0)
                .todayProgress(0.0)
                .build();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public User createUser(AdminUserCreateRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        String password = request.getPassword();
        if (password == null || password.isBlank()) {
            password = "Temp123!";
        }

        String role = request.getRole() != null ? request.getRole() : User.Role.USER.name();
        String status = request.getStatus() != null ? request.getStatus() : User.AccountStatus.ACTIVE.name();

        User user = User.builder()
                .email(request.getEmail())
                .fullName(request.getFullName())
                .passwordHash(passwordEncoder.encode(password))
                .role(User.Role.valueOf(role))
                .status(User.AccountStatus.valueOf(status))
                .avatarUrl(request.getAvatarUrl())
                .build();

        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long userId, AdminUserUpdateRequest request) {
        User user = getUserById(userId);

        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getRole() != null) user.setRole(User.Role.valueOf(request.getRole()));
        if (request.getStatus() != null) user.setStatus(User.AccountStatus.valueOf(request.getStatus()));
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteById(userId);
    }

    @Transactional
    public void updateUserStatus(Long userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(User.AccountStatus.valueOf(status));
        userRepository.save(user);
    }
}
