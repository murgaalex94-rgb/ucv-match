package com.ucvmatch.repository;

import com.ucvmatch.model.Alerta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AlertaRepository extends JpaRepository<Alerta, UUID> {
    List<Alerta> findByEstado(String estado);
    List<Alerta> findByEstudianteId(UUID estudianteId);
    long countByEstado(String estado);
}
