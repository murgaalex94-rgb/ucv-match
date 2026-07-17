package com.ucvmatch.repository;

import com.ucvmatch.model.Mentoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MentoriaRepository extends JpaRepository<Mentoria, UUID> {
    Optional<Mentoria> findBySolicitudId(UUID solicitudId);
}
