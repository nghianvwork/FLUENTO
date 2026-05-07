package com.enova.repository;

import com.enova.model.EventReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventReservationRepository extends JpaRepository<EventReservation, Long> {
    Optional<EventReservation> findByUserIdAndEventId(Long userId, Long eventId);
    Optional<EventReservation> findByUserIdAndEventIdAndCanceledAtIsNull(Long userId, Long eventId);
    List<EventReservation> findByUserIdAndCanceledAtIsNull(Long userId);
    long countByEventIdAndCanceledAtIsNull(Long eventId);
}
