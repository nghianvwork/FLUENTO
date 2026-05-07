package com.enova.repository;

import com.enova.model.AchievementDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AchievementDefinitionRepository extends JpaRepository<AchievementDefinition, Long> {
    Optional<AchievementDefinition> findByAchievementKey(String achievementKey);
}
