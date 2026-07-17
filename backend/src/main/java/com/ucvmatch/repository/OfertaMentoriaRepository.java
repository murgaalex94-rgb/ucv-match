package com.ucvmatch.repository;

import com.ucvmatch.model.OfertaMentoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OfertaMentoriaRepository extends JpaRepository<OfertaMentoria, UUID> {
    List<OfertaMentoria> findBySeniorId(UUID seniorId);
    List<OfertaMentoria> findByEstadoAndMateriaId(String estado, UUID materiaId);
    List<OfertaMentoria> findByEstado(String estado);
    long countBySeniorIdAndEstado(UUID seniorId, String estado);
    boolean existsBySeniorIdAndMateriaIdAndEstadoNot(UUID seniorId, UUID materiaId, String estado);
}
