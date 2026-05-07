package com.enova.repository;

import com.enova.model.ClubPostComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClubPostCommentRepository extends JpaRepository<ClubPostComment, Long> {
    List<ClubPostComment> findByPostIdOrderByCreatedAtAsc(Long postId);
}
