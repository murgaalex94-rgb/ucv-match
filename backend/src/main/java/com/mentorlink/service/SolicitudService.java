package com.mentorlink.service;

import com.mentorlink.model.*;
import com.mentorlink.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final EstudianteRepository estudianteRepository;
    private final OfertaMentoriaRepository ofertaRepository;
    private final MentoriaRepository mentoriaRepository;

    public SolicitudService(SolicitudRepository solicitudRepository,
                             EstudianteRepository estudianteRepository,
                             OfertaMentoriaRepository ofertaRepository,
                             MentoriaRepository mentoriaRepository) {
        this.solicitudRepository = solicitudRepository;
        this.estudianteRepository = estudianteRepository;
        this.ofertaRepository = ofertaRepository;
        this.mentoriaRepository = mentoriaRepository;
    }

    public Solicitud crear(UUID juniorId, UUID ofertaId, String mensaje) {
        Estudiante junior = estudianteRepository.findById(juniorId)
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado"));

        OfertaMentoria oferta = ofertaRepository.findById(ofertaId)
                .orElseThrow(() -> new IllegalArgumentException("Oferta no encontrada"));

        if (oferta.getSenior().getId().equals(juniorId)) {
            throw new IllegalArgumentException("No puedes solicitar tu propia oferta");
        }

        long pendientes = solicitudRepository.countByJuniorIdAndEstado(juniorId, "PENDIENTE");
        if (pendientes >= 2) {
            throw new IllegalArgumentException("Máximo 2 solicitudes pendientes permitidas");
        }

        Solicitud s = new Solicitud();
        s.setJunior(junior);
        s.setOferta(oferta);
        s.setMensaje(mensaje);
        s.setEstado("PENDIENTE");
        return solicitudRepository.save(s);
    }

    public List<Solicitud> misSolicitudes(UUID juniorId) {
        return solicitudRepository.findByJuniorId(juniorId);
    }

    public List<Solicitud> recibidas(UUID seniorId) {
        return solicitudRepository.findByOfertaSeniorId(seniorId);
    }

    @Transactional
    public Mentoria aceptar(UUID solicitudId, UUID seniorId) {
        Solicitud s = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));
        if (!s.getOferta().getSenior().getId().equals(seniorId)) {
            throw new IllegalArgumentException("No tienes permiso para aceptar esta solicitud");
        }
        s.setEstado("ACEPTADA");
        s.setFechaRespuesta(LocalDateTime.now());
        solicitudRepository.save(s);

        Mentoria m = new Mentoria();
        m.setSolicitud(s);
        m.setFechaInicio(LocalDateTime.now());
        m.setEstado("ACTIVA");
        mentoriaRepository.save(m);

        return m;
    }

    @Transactional
    public Solicitud rechazar(UUID solicitudId, UUID seniorId, String motivo) {
        Solicitud s = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));
        if (!s.getOferta().getSenior().getId().equals(seniorId)) {
            throw new IllegalArgumentException("No tienes permiso para rechazar esta solicitud");
        }
        s.setEstado("RECHAZADA");
        s.setFechaRespuesta(LocalDateTime.now());
        s.setMensajeRechazo(motivo);
        return solicitudRepository.save(s);
    }
}
