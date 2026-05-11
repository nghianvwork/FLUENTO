package com.enova.service;

import com.enova.dto.request.LoginRequest;
import com.enova.dto.request.RegisterRequest;
import com.enova.dto.response.AuthResponse;
import com.enova.model.RefreshToken;
import com.enova.model.User;
import com.enova.model.UserProfile;
import com.enova.model.Subscription;
import com.enova.repository.RefreshTokenRepository;
import com.enova.repository.UserRepository;
import com.enova.repository.UserProfileRepository;
import com.enova.repository.SubscriptionRepository;
import com.enova.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.ZoneId;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
        private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(User.Role.USER)
                .status(User.AccountStatus.ACTIVE)
                .build();
        user = userRepository.save(user);

        // Create default profile
        UserProfile profile = UserProfile.builder()
                .user(user)
                .displayName(request.getFullName())
                .nativeLanguage("Vietnamese")
                .cefrLevel(UserProfile.CefrLevel.A1)
                .targetLevel(UserProfile.CefrLevel.B2)
                .dailyGoalMinutes(15)
                .preferredAccent(UserProfile.AccentPreference.AMERICAN)
                .build();
        profileRepository.save(profile);

        // Create free subscription
        Subscription subscription = Subscription.builder()
                .user(user)
                .planType(Subscription.PlanType.FREE)
                .startDate(LocalDateTime.now())
                .status(Subscription.SubscriptionStatus.ACTIVE)
                .build();
        subscriptionRepository.save(subscription);

        String token = tokenProvider.generateToken(user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());
        storeRefreshToken(user, refreshToken);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .userId(user.getId())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());
        storeRefreshToken(user, refreshToken);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .userId(user.getId())
                .build();
    }

        @Transactional
        public AuthResponse refreshToken(String refreshToken) {
                if (!tokenProvider.validateToken(refreshToken)) {
                        throw new IllegalArgumentException("Invalid refresh token");
                }

                String email = tokenProvider.getEmailFromToken(refreshToken);
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                RefreshToken storedToken = getValidStoredToken(refreshToken);
                storedToken.setRevokedAt(LocalDateTime.now());
                refreshTokenRepository.save(storedToken);

                String newToken = tokenProvider.generateToken(email);
                String newRefreshToken = tokenProvider.generateRefreshToken(email);
                storeRefreshToken(user, newRefreshToken);

                return AuthResponse.builder()
                                .token(newToken)
                                .refreshToken(newRefreshToken)
                                .email(user.getEmail())
                                .fullName(user.getFullName())
                                .role(user.getRole().name())
                                .userId(user.getId())
                                .build();
        }

        @Transactional
        public void logout(String refreshToken) {
                if (refreshToken == null || refreshToken.isBlank()) {
                        return;
                }

                if (!tokenProvider.validateToken(refreshToken)) {
                        return;
                }

                String tokenHash = hashToken(refreshToken);
                refreshTokenRepository.findByTokenHash(tokenHash)
                                .filter(token -> token.getRevokedAt() == null)
                                .ifPresent(token -> {
                                        token.setRevokedAt(LocalDateTime.now());
                                        refreshTokenRepository.save(token);
                                });
        }

        private RefreshToken getValidStoredToken(String refreshToken) {
                String tokenHash = hashToken(refreshToken);
                RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

                if (storedToken.getRevokedAt() != null) {
                        throw new IllegalArgumentException("Refresh token revoked");
                }
                if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                        throw new IllegalArgumentException("Refresh token expired");
                }
                return storedToken;
        }

        private void storeRefreshToken(User user, String refreshToken) {
                LocalDateTime expiresAt = tokenProvider.getTokenExpiration(refreshToken)
                                .toInstant()
                                .atZone(ZoneId.systemDefault())
                                .toLocalDateTime();
                RefreshToken token = RefreshToken.builder()
                                .user(user)
                                .tokenHash(hashToken(refreshToken))
                                .expiresAt(expiresAt)
                                .build();
                refreshTokenRepository.save(token);
        }

        private String hashToken(String token) {
                try {
                        MessageDigest digest = MessageDigest.getInstance("SHA-256");
                        byte[] hashed = digest.digest(token.getBytes(StandardCharsets.UTF_8));
                        StringBuilder builder = new StringBuilder();
                        for (byte b : hashed) {
                                builder.append(String.format("%02x", b));
                        }
                        return builder.toString();
                } catch (NoSuchAlgorithmException e) {
                        throw new IllegalStateException("SHA-256 not available", e);
                }
        }
}
