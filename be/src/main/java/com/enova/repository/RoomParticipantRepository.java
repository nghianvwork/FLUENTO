package com.enova.repository;

import com.enova.model.RoomParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoomParticipantRepository extends JpaRepository<RoomParticipant, Long> {
    List<RoomParticipant> findByRoomId(Long roomId);
    long countByRoomIdAndLeftAtIsNull(Long roomId);
    List<RoomParticipant> findByRoomIdAndUserIdOrderByJoinedAtDesc(Long roomId, Long userId);
    List<RoomParticipant> findByUserIdOrderByJoinedAtDesc(Long userId);
}
