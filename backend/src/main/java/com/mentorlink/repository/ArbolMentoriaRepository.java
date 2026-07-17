package com.mentorlink.repository;

import com.mentorlink.model.ArbolMentoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ArbolMentoriaRepository extends JpaRepository<ArbolMentoria, UUID> {
    List<ArbolMentoria> findByMentorId(UUID mentorId);
    Optional<ArbolMentoria> findByAprendizId(UUID aprendizId);
    List<ArbolMentoria> findByNodoPadreId(UUID nodoPadreId);
}
