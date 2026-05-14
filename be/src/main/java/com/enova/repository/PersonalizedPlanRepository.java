package com.enova.repository;

import com.enova.model.PersonalizedPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PersonalizedPlanRepository extends JpaRepository<PersonalizedPlan, Long> {
    Optional<PersonalizedPlan> findFirstByUserIdAndIsActiveTrueOrderByCreatedAtDesc(Long userId);
    List<PersonalizedPlan> findByUserIdOrderByCreatedAtDesc(Long userId);
}
