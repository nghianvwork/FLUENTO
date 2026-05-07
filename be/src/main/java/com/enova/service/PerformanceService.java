package com.enova.service;

import com.enova.exception.ResourceNotFoundException;
import com.enova.model.*;
import com.enova.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PerformanceService {
    private final PerformanceReportRepository reportRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;

    public List<PerformanceReport> getUserReports(Long userId) {
        return reportRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public PerformanceReport generateWeeklyReport(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        Random r = new Random();
        PerformanceReport report = PerformanceReport.builder()
                .user(user)
                .reportPeriodStart(LocalDate.now().minusDays(7))
                .reportPeriodEnd(LocalDate.now())
                .overallScore(60 + r.nextInt(40))
                .grammarAnalysisJson("{\"accuracy\":"+( 65+r.nextInt(35))+",\"weakAreas\":[\"present perfect\",\"articles\"],\"strongAreas\":[\"simple past\",\"comparatives\"]}")
                .vocabularyAnalysisJson("{\"wordsLearned\":"+( 10+r.nextInt(20))+",\"retention\":"+( 70+r.nextInt(30))+",\"topCategories\":[\"business\",\"technology\"]}")
                .pronunciationAnalysisJson("{\"overallScore\":"+( 60+r.nextInt(40))+",\"weakSounds\":[\"th\",\"r\"],\"improvement\":"+( r.nextInt(15))+"}")
                .strengthMapJson("{\"speaking\":"+( 60+r.nextInt(40))+",\"listening\":"+( 60+r.nextInt(40))+",\"reading\":"+( 60+r.nextInt(40))+",\"writing\":"+( 60+r.nextInt(40))+"}")
                .errorPatternsJson("[{\"pattern\":\"Subject-verb agreement\",\"frequency\":3},{\"pattern\":\"Article usage\",\"frequency\":5}]")
                .peerBenchmarkJson("{\"percentile\":"+( 40+r.nextInt(60))+",\"avgScore\":72}")
                .cefrEstimate(profile.getCefrLevel())
                .recommendationsJson("[\"Practice present perfect tense with real-life examples\",\"Focus on article usage (a/an/the)\",\"Join speaking rooms 3x/week\"]")
                .build();

        return reportRepository.save(report);
    }
}
