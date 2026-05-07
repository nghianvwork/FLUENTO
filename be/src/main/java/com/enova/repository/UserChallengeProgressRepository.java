package com.enova.repository;

import com.enova.model.UserChallengeProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserChallengeProgressRepository extends JpaRepository<UserChallengeProgress, Long> {
    List<UserChallengeProgress> findByUserId(Long userId);
    Optional<UserChallengeProgress> findByUserIdAndChallengeId(Long userId, Long challengeId);
}
