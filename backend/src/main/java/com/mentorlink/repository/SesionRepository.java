package com.mentorlink.repository;

import com.mentorlink.model.Sesion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SesionRepository extends JpaRepository<Sesion, UUID> {
    List<Sesion> findByMentoriaId(UUID mentoriaId);
    List<Sesion> findByEstado(String estado);
}
