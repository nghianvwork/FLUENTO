package com.enova.controller;

import com.enova.dto.request.*;
import com.enova.dto.response.*;
import com.enova.model.*;
import com.enova.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    private final ContentService contentService;
    private final RoleplayService roleplayService;
    private final SpeakingRoomService speakingRoomService;
    private final AdminOpsService adminOpsService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AdminOverviewResponse>> getOverview() {
        return ResponseEntity.ok(ApiResponse.success(adminOpsService.getOverview()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getAllUsers() {
        List<AdminUserResponse> users = userService.getAllUsers().stream()
                .map(this::toAdminUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<AdminUserResponse>> createUser(@RequestBody AdminUserCreateRequest request) {
        User user = userService.createUser(request);
        return ResponseEntity.ok(ApiResponse.success(toAdminUserResponse(user)));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUser(
            @PathVariable Long userId, @RequestBody AdminUserUpdateRequest request) {
        User user = userService.updateUser(userId, request);
        return ResponseEntity.ok(ApiResponse.success(toAdminUserResponse(user)));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted"));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<String>> updateStatus(
            @PathVariable Long userId, @RequestBody Map<String, String> request) {
        userService.updateUserStatus(userId, request.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Status updated"));
    }

    @GetMapping("/content")
    public ResponseEntity<ApiResponse<List<AdminContentResponse>>> getAllContent() {
        List<AdminContentResponse> items = contentService.getAllContent().stream()
                .map(this::toAdminContentResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @PostMapping("/content")
    public ResponseEntity<ApiResponse<AdminContentResponse>> createContent(@RequestBody AdminContentRequest request) {
        ContentItem item = contentService.createContent(toContentItemForCreate(request));
        return ResponseEntity.ok(ApiResponse.success(toAdminContentResponse(item)));
    }

    @PutMapping("/content/{id}")
    public ResponseEntity<ApiResponse<AdminContentResponse>> updateContent(
            @PathVariable Long id, @RequestBody AdminContentRequest request) {
        ContentItem updated = contentService.updateContent(id, toContentItemForUpdate(request));
        return ResponseEntity.ok(ApiResponse.success(toAdminContentResponse(updated)));
    }

    @DeleteMapping("/content/{id}")
    public ResponseEntity<ApiResponse<String>> deleteContent(@PathVariable Long id) {
        contentService.deleteContent(id);
        return ResponseEntity.ok(ApiResponse.success("Content deleted"));
    }

    @GetMapping("/roleplay/scenarios")
    public ResponseEntity<ApiResponse<List<AdminScenarioResponse>>> getAllScenarios() {
        List<AdminScenarioResponse> scenarios = roleplayService.getAllScenarios().stream()
                .map(this::toAdminScenarioResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(scenarios));
    }

    @PostMapping("/roleplay/scenarios")
    public ResponseEntity<ApiResponse<AdminScenarioResponse>> createScenario(@RequestBody AdminScenarioRequest request) {
        Scenario scenario = roleplayService.createScenario(toScenarioForCreate(request));
        return ResponseEntity.ok(ApiResponse.success(toAdminScenarioResponse(scenario)));
    }

    @PutMapping("/roleplay/scenarios/{id}")
    public ResponseEntity<ApiResponse<AdminScenarioResponse>> updateScenario(
            @PathVariable Long id, @RequestBody AdminScenarioRequest request) {
        Scenario scenario = roleplayService.updateScenario(id, toScenarioForUpdate(request));
        return ResponseEntity.ok(ApiResponse.success(toAdminScenarioResponse(scenario)));
    }

    @DeleteMapping("/roleplay/scenarios/{id}")
    public ResponseEntity<ApiResponse<String>> deleteScenario(@PathVariable Long id) {
        roleplayService.deleteScenario(id);
        return ResponseEntity.ok(ApiResponse.success("Scenario deleted"));
    }

    @GetMapping("/speaking/rooms")
    public ResponseEntity<ApiResponse<List<AdminSpeakingRoomResponse>>> getAllRooms() {
        List<AdminSpeakingRoomResponse> rooms = speakingRoomService.getAllRooms().stream()
                .map(this::toAdminRoomResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(rooms));
    }

    @PostMapping("/speaking/rooms")
    public ResponseEntity<ApiResponse<AdminSpeakingRoomResponse>> createRoom(@RequestBody AdminSpeakingRoomRequest request) {
        SpeakingRoom room = speakingRoomService.createRoom(toSpeakingRoomForCreate(request));
        return ResponseEntity.ok(ApiResponse.success(toAdminRoomResponse(room)));
    }

    @PutMapping("/speaking/rooms/{id}")
    public ResponseEntity<ApiResponse<AdminSpeakingRoomResponse>> updateRoom(
            @PathVariable Long id, @RequestBody AdminSpeakingRoomRequest request) {
        SpeakingRoom room = speakingRoomService.updateRoom(id, toSpeakingRoomForUpdate(request));
        return ResponseEntity.ok(ApiResponse.success(toAdminRoomResponse(room)));
    }

    @DeleteMapping("/speaking/rooms/{id}")
    public ResponseEntity<ApiResponse<String>> deleteRoom(@PathVariable Long id) {
        speakingRoomService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.success("Room deleted"));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<List<AdminReportResponse>>> getReports() {
        return ResponseEntity.ok(ApiResponse.success(adminOpsService.getReports()));
    }

    @GetMapping("/moderation/tickets")
    public ResponseEntity<ApiResponse<List<AdminTicketResponse>>> getTickets() {
        return ResponseEntity.ok(ApiResponse.success(adminOpsService.getTickets()));
    }

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<AdminSettingsResponse>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success(adminOpsService.getSettings()));
    }

    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<AdminSettingsResponse>> updateSettings(@RequestBody AdminSettingsRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminOpsService.updateSettings(request)));
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        String plan = switch (user.getRole()) {
            case PREMIUM -> "Premium";
            case ADMIN -> "Internal";
            case USER -> "Free";
        };
        String lastActive = user.getLastLoginAt() != null
            ? user.getLastLoginAt().toString()
            : user.getCreatedAt().toString();
        Integer totalXp = userService.getTotalXp(user.getId());

        return AdminUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
            .plan(plan)
            .lastActive(lastActive)
            .totalXp(totalXp)
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    private AdminContentResponse toAdminContentResponse(ContentItem item) {
        String status = item.getIsActive() != null && item.getIsActive() ? "PUBLISHED" : "ARCHIVED";
        return AdminContentResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .type(item.getSourceType() != null ? item.getSourceType().name() : null)
                .topic(item.getTopic())
                .difficulty(item.getDifficulty() != null ? item.getDifficulty().name() : null)
                .status(status)
                .owner("System")
                .updatedAt(item.getCreatedAt())
                .build();
    }

    private ContentItem toContentItemForCreate(AdminContentRequest request) {
        ContentItem.ContentItemBuilder builder = ContentItem.builder();
        builder.title(request.getTitle() != null ? request.getTitle() : "Untitled Content");
        builder.sourceUrl(request.getSourceUrl());
        String sourceType = request.getSourceType() != null ? request.getSourceType() : ContentItem.SourceType.ARTICLE.name();
        builder.sourceType(ContentItem.SourceType.valueOf(sourceType));
        builder.thumbnailUrl(request.getThumbnailUrl());
        builder.durationSeconds(request.getDurationSeconds());
        String difficulty = request.getDifficulty() != null ? request.getDifficulty() : Scenario.Difficulty.INTERMEDIATE.name();
        builder.difficulty(Scenario.Difficulty.valueOf(difficulty));
        builder.topic(request.getTopic());
        builder.transcript(request.getTranscript());
        builder.summary(request.getSummary());
        builder.tags(request.getTags());
        builder.isActive(request.getIsActive() != null ? request.getIsActive() : Boolean.TRUE);
        return builder.build();
    }

    private ContentItem toContentItemForUpdate(AdminContentRequest request) {
        ContentItem.ContentItemBuilder builder = ContentItem.builder();
        builder.title(request.getTitle());
        builder.sourceUrl(request.getSourceUrl());
        if (request.getSourceType() != null) {
            builder.sourceType(ContentItem.SourceType.valueOf(request.getSourceType()));
        }
        builder.thumbnailUrl(request.getThumbnailUrl());
        builder.durationSeconds(request.getDurationSeconds());
        if (request.getDifficulty() != null) {
            builder.difficulty(Scenario.Difficulty.valueOf(request.getDifficulty()));
        }
        builder.topic(request.getTopic());
        builder.transcript(request.getTranscript());
        builder.summary(request.getSummary());
        builder.tags(request.getTags());
        if (request.getIsActive() != null) {
            builder.isActive(request.getIsActive());
        }
        return builder.build();
    }

    private AdminScenarioResponse toAdminScenarioResponse(Scenario scenario) {
        String status = scenario.getIsActive() != null && scenario.getIsActive() ? "ACTIVE" : "ARCHIVED";
        return AdminScenarioResponse.builder()
                .id(scenario.getId())
                .title(scenario.getTitle())
                .category(scenario.getCategory() != null ? scenario.getCategory().name() : null)
                .difficulty(scenario.getDifficulty() != null ? scenario.getDifficulty().name() : null)
                .status(status)
                .usageCount(0)
                .rating(0)
                .build();
    }

    private Scenario toScenarioForCreate(AdminScenarioRequest request) {
        Scenario.ScenarioBuilder builder = Scenario.builder();
        builder.title(request.getTitle() != null ? request.getTitle() : "Untitled Scenario");
        builder.description(request.getDescription());
        String category = request.getCategory() != null ? request.getCategory() : Scenario.ScenarioCategory.MEETING.name();
        builder.category(Scenario.ScenarioCategory.valueOf(category));
        String difficulty = request.getDifficulty() != null ? request.getDifficulty() : Scenario.Difficulty.INTERMEDIATE.name();
        builder.difficulty(Scenario.Difficulty.valueOf(difficulty));
        String personality = request.getAiPersonality() != null ? request.getAiPersonality() : Scenario.AiPersonality.PROFESSIONAL.name();
        builder.aiPersonality(Scenario.AiPersonality.valueOf(personality));
        builder.contextPrompt(request.getContextPrompt() != null ? request.getContextPrompt() : "Default context prompt");
        builder.tags(request.getTags());
        builder.isActive(request.getIsActive() != null ? request.getIsActive() : Boolean.TRUE);
        return builder.build();
    }

    private Scenario toScenarioForUpdate(AdminScenarioRequest request) {
        Scenario.ScenarioBuilder builder = Scenario.builder();
        builder.title(request.getTitle());
        builder.description(request.getDescription());
        if (request.getCategory() != null) {
            builder.category(Scenario.ScenarioCategory.valueOf(request.getCategory()));
        }
        if (request.getDifficulty() != null) {
            builder.difficulty(Scenario.Difficulty.valueOf(request.getDifficulty()));
        }
        if (request.getAiPersonality() != null) {
            builder.aiPersonality(Scenario.AiPersonality.valueOf(request.getAiPersonality()));
        }
        builder.contextPrompt(request.getContextPrompt());
        builder.tags(request.getTags());
        if (request.getIsActive() != null) {
            builder.isActive(request.getIsActive());
        }
        return builder.build();
    }

    private AdminSpeakingRoomResponse toAdminRoomResponse(SpeakingRoom room) {
        return AdminSpeakingRoomResponse.builder()
                .id(room.getId())
                .title(room.getTitle())
                .topic(room.getTopic())
                .status(mapRoomStatus(room.getStatus()))
                .host("AI Moderator")
                .participants(room.getCurrentParticipants() != null ? room.getCurrentParticipants() : 0)
                .capacity(room.getMaxParticipants() != null ? room.getMaxParticipants() : 0)
                .build();
    }

    private SpeakingRoom toSpeakingRoomForCreate(AdminSpeakingRoomRequest request) {
        SpeakingRoom.SpeakingRoomBuilder builder = SpeakingRoom.builder();
        builder.title(request.getTitle() != null ? request.getTitle() : "New Speaking Room");
        builder.topic(request.getTopic());
        builder.maxParticipants(request.getMaxParticipants() != null ? request.getMaxParticipants() : 5);
        String difficulty = request.getDifficultyLevel() != null ? request.getDifficultyLevel() : Scenario.Difficulty.INTERMEDIATE.name();
        builder.difficultyLevel(Scenario.Difficulty.valueOf(difficulty));
        String roomType = request.getRoomType() != null ? request.getRoomType() : SpeakingRoom.RoomType.DISCUSSION.name();
        builder.roomType(SpeakingRoom.RoomType.valueOf(roomType));
        if (request.getStatus() != null) builder.status(mapRoomStatus(request.getStatus()));
        return builder.build();
    }

    private SpeakingRoom toSpeakingRoomForUpdate(AdminSpeakingRoomRequest request) {
        SpeakingRoom.SpeakingRoomBuilder builder = SpeakingRoom.builder();
        builder.title(request.getTitle());
        builder.topic(request.getTopic());
        builder.maxParticipants(request.getMaxParticipants());
        if (request.getDifficultyLevel() != null) {
            builder.difficultyLevel(Scenario.Difficulty.valueOf(request.getDifficultyLevel()));
        }
        if (request.getRoomType() != null) {
            builder.roomType(SpeakingRoom.RoomType.valueOf(request.getRoomType()));
        }
        if (request.getStatus() != null) {
            builder.status(mapRoomStatus(request.getStatus()));
        }
        return builder.build();
    }

    private String mapRoomStatus(SpeakingRoom.RoomStatus status) {
        if (status == null) return null;
        return switch (status) {
            case ACTIVE, FULL -> "LIVE";
            case CLOSED -> "PAUSED";
        };
    }

    private SpeakingRoom.RoomStatus mapRoomStatus(String status) {
        if (status == null) return null;
        return switch (status) {
            case "LIVE" -> SpeakingRoom.RoomStatus.ACTIVE;
            case "PAUSED" -> SpeakingRoom.RoomStatus.CLOSED;
            case "SCHEDULED" -> SpeakingRoom.RoomStatus.ACTIVE;
            default -> SpeakingRoom.RoomStatus.ACTIVE;
        };
    }
}
