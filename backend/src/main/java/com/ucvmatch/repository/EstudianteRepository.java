package com.ucvmatch.repository;

import com.ucvmatch.model.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio para la entidad Estudiante
 */
@Repository
public interface EstudianteRepository extends JpaRepository<Estudiante, UUID> {
    
    Optional<Estudiante> findByUsuarioId(UUID usuarioId);
    
    List<Estudiante> findByEsSeniorTrueAndSeniorValidadoFalse();
}
