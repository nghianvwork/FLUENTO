package com.enova.repository;

import com.enova.model.ClubMembership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClubMembershipRepository extends JpaRepository<ClubMembership, Long> {
    Optional<ClubMembership> findByUserIdAndClubId(Long userId, Long clubId);
    Optional<ClubMembership> findByUserIdAndClubIdAndLeftAtIsNull(Long userId, Long clubId);
    List<ClubMembership> findByUserIdAndLeftAtIsNull(Long userId);
    List<ClubMembership> findByClubIdAndLeftAtIsNull(Long clubId);
    long countByClubIdAndLeftAtIsNull(Long clubId);
}
