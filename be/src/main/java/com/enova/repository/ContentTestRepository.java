package com.enova.repository;

import com.enova.model.ContentTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContentTestRepository extends JpaRepository<ContentTest, Long> {
    List<ContentTest> findByContentIdAndIsActiveTrue(Long contentId);
    Optional<ContentTest> findByIdAndIsActiveTrue(Long id);
}
