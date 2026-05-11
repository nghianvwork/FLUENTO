package com.enova.service;

import com.enova.model.User;
import com.enova.model.Vocabulary;
import com.enova.model.VocabularyProgress;
import com.enova.repository.VocabularyProgressRepository;
import com.enova.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SrsService {
    private final VocabularyProgressRepository progressRepository;
    private final UserProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public List<VocabularyProgress> getDueReviews(User user) {
        LocalDateTime now = LocalDateTime.now();
        List<VocabularyProgress> due = progressRepository.findByUserIdAndNextReviewAtLessThanEqualOrderByNextReviewAtAsc(user.getId(), now);
        
        // Also include some completely new words if due list is empty (for demo purposes)
        if (due.isEmpty()) {
            List<VocabularyProgress> all = progressRepository.findByUserId(user.getId());
            for (VocabularyProgress vp : all) {
                if (vp.getNextReviewAt() == null) {
                    vp.setNextReviewAt(now);
                    due.add(vp);
                    if (due.size() >= 10) break;
                }
            }
        }
        return due;
    }

    @Transactional
    public void submitReview(User user, Long vocabProgressId, int quality) {
        // quality: 0=Blackout, 1=Incorrect, 2=Hard, 3=Good, 4=Easy, 5=Perfect
        // SM-2 Algorithm implementation
        VocabularyProgress vp = progressRepository.findById(vocabProgressId)
                .orElseThrow(() -> new RuntimeException("Vocabulary progress not found"));

        if (!vp.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (quality < 3) {
            // Incorrect or Hard -> reset repetitions
            vp.setReviewCount(0);
            vp.setIntervalDays(1);
        } else {
            // Correct
            int repetitions = vp.getReviewCount();
            if (repetitions == 0) {
                vp.setIntervalDays(1);
            } else if (repetitions == 1) {
                vp.setIntervalDays(6);
            } else {
                vp.setIntervalDays((int) Math.round(vp.getIntervalDays() * vp.getEaseFactor()));
            }
            vp.setReviewCount(repetitions + 1);
            vp.setCorrectCount(vp.getCorrectCount() + 1);
            vp.setMasteryLevel(Math.min(100, vp.getMasteryLevel() + 10)); // Increase mastery
        }

        // Calculate new Ease Factor
        double newEaseFactor = vp.getEaseFactor() + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (newEaseFactor < 1.3) newEaseFactor = 1.3;
        vp.setEaseFactor(newEaseFactor);

        vp.setLastReviewedAt(LocalDateTime.now());
        vp.setNextReviewAt(LocalDateTime.now().plusDays(vp.getIntervalDays()));

        progressRepository.save(vp);
        profileRepository.findByUserId(user.getId()).ifPresent(profile -> {
            profile.setLastStudyDate(LocalDateTime.now());
            profileRepository.save(profile);
        });
    }
}
