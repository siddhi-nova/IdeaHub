package com.ideahub.idea;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IdeaRepository extends JpaRepository<Idea, Long> {
    List<Idea> findAllByOrderByCreatedAtDesc();
    List<Idea> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
}
