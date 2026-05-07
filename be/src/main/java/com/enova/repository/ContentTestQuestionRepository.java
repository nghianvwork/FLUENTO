package com.enova.repository;

import com.enova.model.ContentTestQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentTestQuestionRepository extends JpaRepository<ContentTestQuestion, Long> {
    List<ContentTestQuestion> findByTestIdOrderByOrderIndexAsc(Long testId);
}
