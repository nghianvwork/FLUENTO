package com.enova.service;

import com.enova.exception.ResourceNotFoundException;
import com.enova.model.*;
import com.enova.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SpeakingRoomService {
    private final SpeakingRoomRepository roomRepository;
    private final RoomParticipantRepository participantRepository;
    private final UserRepository userRepository;

    public List<SpeakingRoom> getActiveRooms() {
        return roomRepository.findByStatusOrderByCreatedAtDesc(SpeakingRoom.RoomStatus.ACTIVE);
    }

    public List<SpeakingRoom> getAllRooms() {
        return roomRepository.findAll();
    }

    @Transactional
    public SpeakingRoom createRoom(SpeakingRoom room) {
        return roomRepository.save(room);
    }

    @Transactional
    public SpeakingRoom updateRoom(Long roomId, SpeakingRoom update) {
        SpeakingRoom room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        if (update.getTitle() != null) room.setTitle(update.getTitle());
        if (update.getTopic() != null) room.setTopic(update.getTopic());
        if (update.getMaxParticipants() != null) room.setMaxParticipants(update.getMaxParticipants());
        if (update.getDifficultyLevel() != null) room.setDifficultyLevel(update.getDifficultyLevel());
        if (update.getRoomType() != null) room.setRoomType(update.getRoomType());
        if (update.getStatus() != null) room.setStatus(update.getStatus());

        return roomRepository.save(room);
    }

    @Transactional
    public void deleteRoom(Long roomId) {
        roomRepository.deleteById(roomId);
    }

    @Transactional
    public RoomParticipant joinRoom(Long roomId, Long userId) {
        SpeakingRoom room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        long currentCount = participantRepository.countByRoomIdAndLeftAtIsNull(roomId);
        if (currentCount >= room.getMaxParticipants()) {
            throw new IllegalArgumentException("Room is full");
        }

        room.setCurrentParticipants((int) currentCount + 1);
        roomRepository.save(room);

        RoomParticipant participant = RoomParticipant.builder().room(room).user(user).build();
        return participantRepository.save(participant);
    }

    @Transactional
    public void leaveRoom(Long roomId, Long userId) {
        List<RoomParticipant> participants = participantRepository.findByRoomId(roomId);
        participants.stream()
                .filter(p -> p.getUser().getId().equals(userId) && p.getLeftAt() == null)
                .findFirst()
                .ifPresent(p -> {
                    p.setLeftAt(LocalDateTime.now());
                    participantRepository.save(p);
                    SpeakingRoom room = roomRepository.findById(roomId).orElse(null);
                    if (room != null) {
                        long count = participantRepository.countByRoomIdAndLeftAtIsNull(roomId);
                        room.setCurrentParticipants((int) count);
                        roomRepository.save(room);
                    }
                });
    }

    public List<RoomParticipant> getRoomParticipants(Long roomId) {
        return participantRepository.findByRoomId(roomId);
    }
}
