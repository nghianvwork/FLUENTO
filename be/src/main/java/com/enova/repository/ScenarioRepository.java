package com.enova.repository;

import com.enova.model.Scenario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScenarioRepository extends JpaRepository<Scenario, Long> {
    List<Scenario> findByIsActiveTrue();
    List<Scenario> findByCategoryAndIsActiveTrue(Scenario.ScenarioCategory category);
    List<Scenario> findByDifficultyAndIsActiveTrue(Scenario.Difficulty difficulty);
}
