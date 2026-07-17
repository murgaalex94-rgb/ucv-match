package com.ucvmatch.service;

import com.ucvmatch.model.Materia;
import com.ucvmatch.repository.MateriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MateriaService {

    private final MateriaRepository materiaRepository;

    public MateriaService(MateriaRepository materiaRepository) {
        this.materiaRepository = materiaRepository;
    }

    public List<Materia> listarActivas() {
        return materiaRepository.findByActivaTrue();
    }

    public List<Materia> listarTodas() {
        return materiaRepository.findAll();
    }

    public Optional<Materia> porId(UUID id) {
        return materiaRepository.findById(id);
    }

    public Materia crear(Materia materia) {
        if (materiaRepository.findByNombreAndCarrera(materia.getNombre(), materia.getCarrera()).isPresent()) {
            throw new IllegalArgumentException("Ya existe una materia con ese nombre en la misma carrera");
        }
        return materiaRepository.save(materia);
    }

    public Materia actualizar(UUID id, Materia datos) {
        Materia materia = materiaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Materia no encontrada"));
        materia.setNombre(datos.getNombre());
        materia.setCarrera(datos.getCarrera());
        materia.setCicloRecomendado(datos.getCicloRecomendado());
        materia.setDificultadReportada(datos.getDificultadReportada());
        return materiaRepository.save(materia);
    }

    public void desactivar(UUID id) {
        Materia materia = materiaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Materia no encontrada"));
        materia.setActiva(false);
        materiaRepository.save(materia);
    }

    public List<Materia> buscarPorNombre(String nombre) {
        return materiaRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public List<Materia> buscarPorCarrera(String carrera) {
        return materiaRepository.findByCarrera(carrera);
    }
}
