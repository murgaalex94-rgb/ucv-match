package com.ucvmatch.service;

import com.ucvmatch.model.*;
import com.ucvmatch.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class SesionService {

    private final SesionRepository sesionRepository;
    private final MentoriaRepository mentoriaRepository;
    private final EstudianteRepository estudianteRepository;

    public SesionService(SesionRepository sesionRepository,
                          MentoriaRepository mentoriaRepository,
                          EstudianteRepository estudianteRepository) {
        this.sesionRepository = sesionRepository;
        this.mentoriaRepository = mentoriaRepository;
        this.estudianteRepository = estudianteRepository;
    }

    public Sesion programar(UUID mentoriaId, LocalDateTime fechaProgramada, UUID userId) {
        Mentoria m = mentoriaRepository.findById(mentoriaId)
                .orElseThrow(() -> new IllegalArgumentException("Mentoría no encontrada"));
        if (!m.getEstado().equals("ACTIVA")) {
            throw new IllegalArgumentException("La mentoría no está activa");
        }
        Sesion s = new Sesion();
        s.setMentoria(m);
        s.setFechaProgramada(fechaProgramada);
        s.setEstado("PROGRAMADA");
        return sesionRepository.save(s);
    }

    @Transactional
    public Sesion iniciar(UUID sesionId, UUID userId) {
        Sesion s = sesionRepository.findById(sesionId)
                .orElseThrow(() -> new IllegalArgumentException("Sesión no encontrada"));
        if (!s.getEstado().equals("PROGRAMADA")) {
            throw new IllegalArgumentException("La sesión no está programada");
        }
        s.setHoraInicioReal(LocalDateTime.now());
        s.setEstado("EN_CURSO");
        return sesionRepository.save(s);
    }

    @Transactional
    public Sesion finalizar(UUID sesionId, UUID userId, Integer calificacion, String comentario, String temas) {
        Sesion s = sesionRepository.findById(sesionId)
                .orElseThrow(() -> new IllegalArgumentException("Sesión no encontrada"));
        if (!s.getEstado().equals("EN_CURSO")) {
            throw new IllegalArgumentException("La sesión no está en curso");
        }
        s.setHoraFinReal(LocalDateTime.now());
        s.setTemasTratados(temas);

        long duracion = ChronoUnit.MINUTES.between(s.getHoraInicioReal(), s.getHoraFinReal());
        s.setDuracionMinutos((int) duracion);

        Mentoria m = s.getMentoria();
        Solicitud sol = m.getSolicitud();
        UUID juniorId = sol.getJunior().getUsuario().getId();
        UUID seniorId = sol.getOferta().getSenior().getUsuario().getId();

        if (userId.equals(juniorId)) {
            s.setCalificacionJunior(calificacion);
            s.setComentarioJunior(comentario);
        } else if (userId.equals(seniorId)) {
            s.setCalificacionSenior(calificacion);
            s.setComentarioSenior(comentario);
        }

        if (duracion < 20) {
            s.setEstado("NO_VALIDA");
        } else {
            s.setEstado("COMPLETADA");
        }

        return sesionRepository.save(s);
    }
}
