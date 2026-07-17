package com.ucvmatch.repository;

import com.ucvmatch.model.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SolicitudRepository extends JpaRepository<Solicitud, UUID> {
    List<Solicitud> findByJuniorId(UUID juniorId);
    List<Solicitud> findByOfertaSeniorId(UUID seniorId);
    long countByJuniorIdAndEstado(UUID juniorId, String estado);
}
