package com.ucvmatch.repository;

import com.ucvmatch.model.TipoLogro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TipoLogroRepository extends JpaRepository<TipoLogro, UUID> {
    Optional<TipoLogro> findByCodigo(String codigo);
}
