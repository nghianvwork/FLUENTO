package com.enova.repository;

import com.enova.model.PerformanceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PerformanceReportRepository extends JpaRepository<PerformanceReport, Long> {
    List<PerformanceReport> findByUserIdOrderByCreatedAtDesc(Long userId);
}
