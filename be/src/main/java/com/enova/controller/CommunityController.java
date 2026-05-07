package com.enova.controller;

import com.enova.dto.request.CommunityCommentRequest;
import com.enova.dto.request.CommunityPostRequest;
import com.enova.dto.response.*;
import com.enova.model.User;
import com.enova.service.CommunityService;
import com.enova.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {
    private final CommunityService communityService;
    private final UserService userService;

    @GetMapping("/clubs")
    public ResponseEntity<ApiResponse<List<CommunityClubResponse>>> getClubs(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(communityService.getClubs(user.getId())));
    }

    @PostMapping("/clubs/{clubId}/join")
    public ResponseEntity<ApiResponse<CommunityClubResponse>> joinClub(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long clubId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(communityService.joinClub(clubId, user.getId())));
    }

    @PostMapping("/clubs/{clubId}/leave")
    public ResponseEntity<ApiResponse<CommunityClubResponse>> leaveClub(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long clubId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(communityService.leaveClub(clubId, user.getId())));
    }

    @GetMapping("/clubs/{clubId}")
    public ResponseEntity<ApiResponse<CommunityClubDetailResponse>> getClubDetail(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long clubId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(communityService.getClubDetail(clubId, user.getId())));
    }

    @GetMapping("/clubs/{clubId}/members")
    public ResponseEntity<ApiResponse<List<CommunityClubMemberResponse>>> getClubMembers(
            @PathVariable Long clubId) {
        return ResponseEntity.ok(ApiResponse.success(communityService.getClubMembers(clubId)));
    }

    @GetMapping("/clubs/{clubId}/posts")
    public ResponseEntity<ApiResponse<List<CommunityPostResponse>>> getClubPosts(
            @PathVariable Long clubId) {
        return ResponseEntity.ok(ApiResponse.success(communityService.getClubPosts(clubId)));
    }

    @PostMapping("/clubs/{clubId}/posts")
    public ResponseEntity<ApiResponse<CommunityPostResponse>> createPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long clubId,
            @RequestBody CommunityPostRequest request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                communityService.createPost(clubId, user.getId(), request.getContent())));
    }

    @PostMapping("/clubs/{clubId}/posts/{postId}/comments")
    public ResponseEntity<ApiResponse<CommunityPostCommentResponse>> addComment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long clubId,
            @PathVariable Long postId,
            @RequestBody CommunityCommentRequest request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                communityService.addComment(clubId, postId, user.getId(), request.getContent())));
    }

    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<CommunityEventResponse>>> getEvents(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(communityService.getEvents(user.getId())));
    }

    @GetMapping("/match")
    public ResponseEntity<ApiResponse<CommunityMatchResponse>> getMatch(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(communityService.findMatch(user.getId())));
    }

    @PostMapping("/events/{eventId}/reserve")
    public ResponseEntity<ApiResponse<CommunityEventResponse>> reserveEvent(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long eventId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(communityService.reserveEvent(eventId, user.getId())));
    }

    @PostMapping("/events/{eventId}/cancel")
    public ResponseEntity<ApiResponse<CommunityEventResponse>> cancelReservation(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long eventId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(communityService.cancelReservation(eventId, user.getId())));
    }
}
