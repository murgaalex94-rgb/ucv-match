package com.ucvmatch.repository;

import com.ucvmatch.model.Materia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MateriaRepository extends JpaRepository<Materia, UUID> {
    List<Materia> findByActivaTrue();
    List<Materia> findByCarrera(String carrera);
    List<Materia> findByNombreContainingIgnoreCase(String nombre);
    Optional<Materia> findByNombreAndCarrera(String nombre, String carrera);
}
