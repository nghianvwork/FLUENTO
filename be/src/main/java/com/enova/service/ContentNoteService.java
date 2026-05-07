package com.enova.service;

import com.enova.dto.request.ContentNoteRequest;
import com.enova.dto.response.ContentNoteResponse;
import com.enova.model.ContentItem;
import com.enova.model.ContentNote;
import com.enova.model.User;
import com.enova.repository.ContentNoteRepository;
import com.enova.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentNoteService {
    private final ContentNoteRepository noteRepository;
    private final ContentService contentService;
    private final UserRepository userRepository;

    public List<ContentNoteResponse> getUserNotes(Long userId, Long contentId) {
        List<ContentNote> notes = contentId != null
                ? noteRepository.findByUserIdAndContentIdOrderByTimestampSecondsAsc(userId, contentId)
                : noteRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notes.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ContentNoteResponse createNote(Long userId, ContentNoteRequest request) {
        ContentItem content = contentService.getContentById(request.getContentId());
        User user = userRepository.findById(userId).orElseThrow();

        ContentNote note = ContentNote.builder()
                .content(content)
                .user(user)
                .noteText(request.getNoteText())
                .timestampSeconds(request.getTimestampSeconds())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return toResponse(noteRepository.save(note));
    }

    @Transactional
    public ContentNoteResponse updateNote(Long userId, Long noteId, ContentNoteRequest request) {
        ContentNote note = noteRepository.findById(noteId).orElseThrow();
        if (!note.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        note.setNoteText(request.getNoteText());
        note.setTimestampSeconds(request.getTimestampSeconds());
        note.setUpdatedAt(LocalDateTime.now());
        return toResponse(noteRepository.save(note));
    }

    @Transactional
    public void deleteNote(Long userId, Long noteId) {
        ContentNote note = noteRepository.findById(noteId).orElseThrow();
        if (!note.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        noteRepository.delete(note);
    }

    private ContentNoteResponse toResponse(ContentNote note) {
        return ContentNoteResponse.builder()
                .id(note.getId())
                .contentId(note.getContent().getId())
                .noteText(note.getNoteText())
                .timestampSeconds(note.getTimestampSeconds())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
