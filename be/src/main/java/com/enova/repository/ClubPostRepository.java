package com.enova.repository;

import com.enova.model.ClubPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClubPostRepository extends JpaRepository<ClubPost, Long> {
    List<ClubPost> findByClubIdOrderByCreatedAtDesc(Long clubId);
}
