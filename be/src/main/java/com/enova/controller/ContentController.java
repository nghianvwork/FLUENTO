package com.enova.controller;

import com.enova.dto.request.ContentNoteRequest;
import com.enova.dto.request.ContentQuizAnswerRequest;
import com.enova.dto.request.ContentVocabularyRequest;
import com.enova.dto.response.*;
import com.enova.model.ContentItem;
import com.enova.model.User;
import com.enova.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class ContentController {
    private final ContentService contentService;
    private final ContentProgressService contentProgressService;
    private final ContentBookmarkService bookmarkService;
    private final ContentNoteService noteService;
    private final ContentVocabularyService vocabularyService;
    private final ContentQuizService quizService;
    private final ContentTranslationService translationService;
    private final ContentTestService testService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ContentItem>>> getAllContent(
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String type) {
        List<ContentItem> items;
        if (topic != null) items = contentService.getContentByTopic(topic);
        else if (type != null) items = contentService.getContentByType(ContentItem.SourceType.valueOf(type));
        else items = contentService.getAllActiveContent();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContentItem>> getContent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(contentService.getContentById(id)));
    }

    @GetMapping("/progress")
    public ResponseEntity<ApiResponse<List<ContentProgressResponse>>> getProgress(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(contentProgressService.getProgress(user.getId())));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<ApiResponse<ContentProgressResponse>> startContent(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(contentProgressService.startContent(id, user.getId())));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<ContentProgressResponse>> completeContent(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(contentProgressService.completeContent(id, user.getId())));
    }

    // Bookmarks
    @GetMapping("/bookmarks")
    public ResponseEntity<ApiResponse<List<ContentBookmarkResponse>>> getBookmarks(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(bookmarkService.getUserBookmarks(user.getId())));
    }

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<ApiResponse<ContentBookmarkResponse>> toggleBookmark(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(bookmarkService.toggleBookmark(user.getId(), id)));
    }

    @GetMapping("/{id}/bookmark-status")
    public ResponseEntity<ApiResponse<Boolean>> getBookmarkStatus(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(bookmarkService.isBookmarked(user.getId(), id)));
    }

    // Notes
    @GetMapping("/notes")
    public ResponseEntity<ApiResponse<List<ContentNoteResponse>>> getNotes(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Long contentId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(noteService.getUserNotes(user.getId(), contentId)));
    }

    @PostMapping("/notes")
    public ResponseEntity<ApiResponse<ContentNoteResponse>> createNote(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ContentNoteRequest request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(noteService.createNote(user.getId(), request)));
    }

    @PutMapping("/notes/{noteId}")
    public ResponseEntity<ApiResponse<ContentNoteResponse>> updateNote(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long noteId,
            @RequestBody ContentNoteRequest request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(noteService.updateNote(user.getId(), noteId, request)));
    }

    @DeleteMapping("/notes/{noteId}")
    public ResponseEntity<ApiResponse<Void>> deleteNote(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long noteId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        noteService.deleteNote(user.getId(), noteId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // Vocabulary
    @GetMapping("/vocabulary")
    public ResponseEntity<ApiResponse<List<ContentVocabularyResponse>>> getVocabulary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Long contentId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(vocabularyService.getUserVocabulary(user.getId(), contentId)));
    }

    @PostMapping("/vocabulary")
    public ResponseEntity<ApiResponse<ContentVocabularyResponse>> saveVocabulary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ContentVocabularyRequest request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(vocabularyService.saveVocabulary(user.getId(), request)));
    }

    @DeleteMapping("/vocabulary/{vocabId}")
    public ResponseEntity<ApiResponse<Void>> deleteVocabulary(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long vocabId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        vocabularyService.deleteVocabulary(user.getId(), vocabId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // Quizzes
    @GetMapping("/{id}/quizzes")
    public ResponseEntity<ApiResponse<List<ContentQuizResponse>>> getQuizzes(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(quizService.getQuizzesByContent(id, user.getId())));
    }

    @PostMapping("/quizzes/answer")
    public ResponseEntity<ApiResponse<ContentQuizResponse>> submitQuizAnswer(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ContentQuizAnswerRequest request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(quizService.submitAnswer(user.getId(), request)));
    }

    // Translations
    @PostMapping("/{id}/translations")
    public ResponseEntity<ApiResponse<ContentTranslationResponse>> createTranslation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody com.enova.dto.request.ContentTranslationRequest request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(translationService.createTranslation(id, user.getId(), request)));
    }

    @GetMapping("/{id}/translations")
    public ResponseEntity<ApiResponse<List<ContentTranslationResponse>>> getTranslations(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(translationService.getTranslationsByContent(id, user.getId())));
    }

    @GetMapping("/translations/my")
    public ResponseEntity<ApiResponse<List<ContentTranslationResponse>>> getMyTranslations(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(translationService.getUserTranslations(user.getId())));
    }

    @DeleteMapping("/translations/{translationId}")
    public ResponseEntity<ApiResponse<Void>> deleteTranslation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long translationId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        translationService.deleteTranslation(translationId, user.getId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // Tests
    @GetMapping("/{id}/tests")
    public ResponseEntity<ApiResponse<List<ContentTestResponse>>> getTests(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(testService.getTestsByContent(id)));
    }

    @GetMapping("/tests/{testId}")
    public ResponseEntity<ApiResponse<ContentTestResponse>> getTest(@PathVariable Long testId) {
        return ResponseEntity.ok(ApiResponse.success(testService.getTestById(testId)));
    }

    @PostMapping("/tests/{testId}/submit")
    public ResponseEntity<ApiResponse<ContentTestAttemptResponse>> submitTest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long testId,
            @RequestBody com.enova.dto.request.ContentTestAnswerRequest request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(testService.submitTest(testId, user.getId(), request)));
    }

    @GetMapping("/tests/{testId}/attempts")
    public ResponseEntity<ApiResponse<List<ContentTestAttemptResponse>>> getTestAttempts(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long testId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(testService.getTestAttempts(testId, user.getId())));
    }

    @GetMapping("/tests/attempts/my")
    public ResponseEntity<ApiResponse<List<ContentTestAttemptResponse>>> getMyTestAttempts(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(testService.getUserTestAttempts(user.getId())));
    }
}
