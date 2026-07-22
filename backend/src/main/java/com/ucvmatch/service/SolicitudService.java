package com.ucvmatch.service;

import com.ucvmatch.model.*;
import com.ucvmatch.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SolicitudService {

    private static final Logger logger = LoggerFactory.getLogger(SolicitudService.class);

    private final SolicitudRepository solicitudRepository;
    private final EstudianteRepository estudianteRepository;
    private final OfertaMentoriaRepository ofertaRepository;
    private final MentoriaRepository mentoriaRepository;
    private final StreamChatService streamChatService;
    private final AlertaService alertaService;

    public SolicitudService(SolicitudRepository solicitudRepository,
                             EstudianteRepository estudianteRepository,
                             OfertaMentoriaRepository ofertaRepository,
                             MentoriaRepository mentoriaRepository,
                             StreamChatService streamChatService,
                             AlertaService alertaService) {
        this.solicitudRepository = solicitudRepository;
        this.estudianteRepository = estudianteRepository;
        this.ofertaRepository = ofertaRepository;
        this.mentoriaRepository = mentoriaRepository;
        this.streamChatService = streamChatService;
        this.alertaService = alertaService;
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

        // 1. Cambiar estado de la solicitud a ACEPTADA
        s.setEstado("ACEPTADA");
        s.setFechaRespuesta(LocalDateTime.now());
        solicitudRepository.save(s);

        // 2. Crear la mentoría con estado ACTIVA
        Mentoria m = new Mentoria();
        m.setSolicitud(s);
        m.setFechaInicio(LocalDateTime.now());
        m.setEstado("ACTIVA");
        mentoriaRepository.save(m);

        // 3. Crear el canal de Stream Chat INMEDIATAMENTE
        String channelId = null;
        try {
            Estudiante junior = s.getJunior();
            Estudiante senior = s.getOferta().getSenior();

            String juniorName = junior.getUsuario().getNombre() != null ? junior.getUsuario().getNombre() : junior.getUsuario().getEmail();
            String seniorName = senior.getUsuario().getNombre() != null ? senior.getUsuario().getNombre() : senior.getUsuario().getEmail();

            logger.info("=== STREAM CHAT DEBUG ===");
            logger.info("Junior ID: {}, Name: {}", junior.getId(), juniorName);
            logger.info("Senior ID: {}, Name: {}", senior.getId(), seniorName);
            logger.info("StreamChatService configured: {}", streamChatService.isConfigured());
            
            if (streamChatService.isConfigured()) {
                channelId = streamChatService.createOrGetChannel(
                    junior.getId(),
                    senior.getId(),
                    juniorName,
                    seniorName
                );
                logger.info("Stream Chat channel created/retrieved: {} for mentorship between {} and {}", 
                    channelId, juniorName, seniorName);
            } else {
                logger.warn("Stream Chat NOT configured - skipping channel creation");
                logger.warn("STREAM_API_KEY present: {}", System.getenv("STREAM_API_KEY") != null);
                logger.warn("STREAM_API_SECRET present: {}", System.getenv("STREAM_API_SECRET") != null);
            }
        } catch (Exception e) {
            logger.error("Error creating Stream Chat channel for mentorship", e);
            // No fallar la aceptación si falla la creación del chat
        }

        // Guardar el channelId en la mentoría
        if (channelId != null) {
            m.setStreamChatChannelId(channelId);
            mentoriaRepository.save(m);
        }

        // 4. Enviar notificación al estudiante
        try {
            Estudiante junior = s.getJunior();
            String materia = s.getOferta().getMateria() != null ? s.getOferta().getMateria().getNombre() : "Mentoría";
            String mentorName = s.getOferta().getSenior().getUsuario().getNombre() != null 
                ? s.getOferta().getSenior().getUsuario().getNombre() 
                : s.getOferta().getSenior().getUsuario().getEmail();

            alertaService.crear(
                "MENTORIA_ACEPTADA",
                junior,
                String.format("¡Felicidades! Tu solicitud de mentoría en %s ha sido aceptada por %s. El chat ya está habilitado para que puedan comenzar a comunicarse.", 
                    materia, mentorName),
                "INFO"
            );
            logger.info("Notification sent to student {} for accepted mentorship", junior.getId());
        } catch (Exception e) {
            logger.error("Error sending notification to student", e);
        }

        // 5. Enviar notificación al mentor (senior)
        try {
            Estudiante senior = s.getOferta().getSenior();
            String materia = s.getOferta().getMateria() != null ? s.getOferta().getMateria().getNombre() : "Mentoría";
            String juniorName = s.getJunior().getUsuario().getNombre() != null 
                ? s.getJunior().getUsuario().getNombre() 
                : s.getJunior().getUsuario().getEmail();

            alertaService.crear(
                "MENTORIA_ACEPTADA",
                senior,
                String.format("Has aceptado la solicitud de mentoría en %s de %s. El chat ya está habilitado para comenzar la mentoría.", 
                    materia, juniorName),
                "INFO"
            );
            logger.info("Notification sent to mentor {} for accepted mentorship", senior.getId());
        } catch (Exception e) {
            logger.error("Error sending notification to mentor", e);
        }

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
