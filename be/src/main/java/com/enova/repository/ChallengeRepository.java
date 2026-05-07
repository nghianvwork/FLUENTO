package com.enova.repository;

import com.enova.model.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    List<Challenge> findByIsActiveTrue();
    List<Challenge> findByChallengeTypeAndIsActiveTrue(String type);
}
