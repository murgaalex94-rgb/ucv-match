package com.mentorlink.repository;

import com.mentorlink.model.Logro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LogroRepository extends JpaRepository<Logro, UUID> {
    List<Logro> findByUsuarioId(UUID usuarioId);
    boolean existsByUsuarioIdAndTipoLogroId(UUID usuarioId, UUID tipoLogroId);
    long countByTipoLogroId(UUID tipoLogroId);
}
