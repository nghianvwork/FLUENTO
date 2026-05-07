package com.enova.repository;

import com.enova.model.SpeakingRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SpeakingRoomRepository extends JpaRepository<SpeakingRoom, Long> {
    List<SpeakingRoom> findByStatusOrderByCreatedAtDesc(SpeakingRoom.RoomStatus status);
}
