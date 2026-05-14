package com.enova.service;

import com.enova.exception.ResourceNotFoundException;
import com.enova.model.JournalEntry;
import com.enova.model.StudyPlanBlock;
import com.enova.model.User;
import com.enova.repository.JournalEntryRepository;
import com.enova.repository.StudyPlanBlockRepository;
import com.enova.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LearningService {
    private final JournalEntryRepository journalRepository;
    private final StudyPlanBlockRepository plannerRepository;
    private final UserRepository userRepository;

    // --- Journal ---
    public List<JournalEntry> getJournalEntries(Long userId) {
        return journalRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public JournalEntry createJournalEntry(Long userId, JournalEntry entry) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        entry.setUser(user);
        return journalRepository.save(entry);
    }

    @Transactional
    public void deleteJournalEntry(Long userId, Long entryId) {
        JournalEntry entry = journalRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Entry not found"));
        if (!entry.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Entry not found");
        }
        journalRepository.delete(entry);
    }

    // --- Planner ---
    public List<StudyPlanBlock> getStudyPlan(Long userId) {
        return plannerRepository.findByUserId(userId);
    }

    @Transactional
    public StudyPlanBlock addPlanBlock(Long userId, StudyPlanBlock block) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        block.setUser(user);
        return plannerRepository.save(block);
    }

    @Transactional
    public void deletePlanBlock(Long userId, Long blockId) {
        StudyPlanBlock block = plannerRepository.findById(blockId)
                .orElseThrow(() -> new ResourceNotFoundException("Block not found"));
        if (!block.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Block not found");
        }
        plannerRepository.delete(block);
    }

    @Transactional
    public StudyPlanBlock toggleBlockCompletion(Long userId, Long blockId) {
        StudyPlanBlock block = plannerRepository.findById(blockId)
                .orElseThrow(() -> new ResourceNotFoundException("Block not found"));
        if (!block.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Block not found");
        }
        block.setIsCompleted(!block.getIsCompleted());
        return plannerRepository.save(block);
    }
}
