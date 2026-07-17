package com.ucvmatch.service;

import com.ucvmatch.model.Estudiante;
import com.ucvmatch.model.Materia;
import com.ucvmatch.model.OfertaMentoria;
import com.ucvmatch.repository.EstudianteRepository;
import com.ucvmatch.repository.MateriaRepository;
import com.ucvmatch.repository.OfertaMentoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OfertaMentoriaService {

    private final OfertaMentoriaRepository ofertaRepository;
    private final EstudianteRepository estudianteRepository;
    private final MateriaRepository materiaRepository;

    public OfertaMentoriaService(OfertaMentoriaRepository ofertaRepository,
                                  EstudianteRepository estudianteRepository,
                                  MateriaRepository materiaRepository) {
        this.ofertaRepository = ofertaRepository;
        this.estudianteRepository = estudianteRepository;
        this.materiaRepository = materiaRepository;
    }

    public OfertaMentoria crear(UUID seniorId, UUID materiaId, String descripcion,
                                 Integer cuposSemanales, String formato) {
        Estudiante senior = estudianteRepository.findById(seniorId)
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado"));

        if (!senior.isEsSenior() || !senior.isSeniorValidado()) {
            throw new IllegalArgumentException("Debes ser un Senior validado para crear ofertas");
        }

        Materia materia = materiaRepository.findById(materiaId)
                .orElseThrow(() -> new IllegalArgumentException("Materia no encontrada"));

        if (ofertaRepository.existsBySeniorIdAndMateriaIdAndEstadoNot(seniorId, materiaId, "INACTIVA")) {
            throw new IllegalArgumentException("Ya tienes una oferta activa para esta materia");
        }

        long activas = ofertaRepository.countBySeniorIdAndEstado(seniorId, "ACTIVA");
        if (activas >= 3) {
            throw new IllegalArgumentException("Máximo 3 mentorías activas permitidas");
        }

        OfertaMentoria oferta = new OfertaMentoria();
        oferta.setSenior(senior);
        oferta.setMateria(materia);
        oferta.setDescripcion(descripcion);
        oferta.setCuposSemanales(cuposSemanales);
        oferta.setFormato(formato);
        oferta.setEstado("ACTIVA");
        return ofertaRepository.save(oferta);
    }

    public List<OfertaMentoria> misOfertas(UUID seniorId) {
        return ofertaRepository.findBySeniorId(seniorId);
    }

    public List<OfertaMentoria> disponibles() {
        return ofertaRepository.findByEstado("ACTIVA");
    }

    public Optional<OfertaMentoria> porId(UUID id) {
        return ofertaRepository.findById(id);
    }

    public OfertaMentoria actualizar(UUID id, UUID seniorId, String descripcion,
                                      Integer cuposSemanales, String formato) {
        OfertaMentoria oferta = ofertaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Oferta no encontrada"));
        if (!oferta.getSenior().getId().equals(seniorId)) {
            throw new IllegalArgumentException("No tienes permiso para editar esta oferta");
        }
        oferta.setDescripcion(descripcion);
        oferta.setCuposSemanales(cuposSemanales);
        oferta.setFormato(formato);
        return ofertaRepository.save(oferta);
    }

    public void desactivar(UUID id, UUID seniorId) {
        OfertaMentoria oferta = ofertaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Oferta no encontrada"));
        if (!oferta.getSenior().getId().equals(seniorId)) {
            throw new IllegalArgumentException("No tienes permiso para desactivar esta oferta");
        }
        oferta.setEstado("INACTIVA");
        ofertaRepository.save(oferta);
    }
}
