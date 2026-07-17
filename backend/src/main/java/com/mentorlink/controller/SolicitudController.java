package com.mentorlink.controller;

import com.mentorlink.model.*;
import com.mentorlink.repository.EstudianteRepository;
import com.mentorlink.repository.UsuarioRepository;
import com.mentorlink.service.SolicitudService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;
    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;

    public SolicitudController(SolicitudService solicitudService,
                                UsuarioRepository usuarioRepository,
                                EstudianteRepository estudianteRepository) {
        this.solicitudService = solicitudService;
        this.usuarioRepository = usuarioRepository;
        this.estudianteRepository = estudianteRepository;
    }

    private Estudiante getCurrentEstudiante() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) return null;
        Usuario u = usuarioRepository.findByEmail(auth.getName()).orElse(null);
        if (u == null) return null;
        return estudianteRepository.findByUsuarioId(u.getId()).orElse(null);
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> body) {
        Estudiante junior = getCurrentEstudiante();
        if (junior == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            UUID ofertaId = UUID.fromString(body.get("ofertaId").toString());
            String mensaje = (String) body.getOrDefault("mensaje", "");
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(solicitudService.crear(junior.getId(), ofertaId, mensaje));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/mis-solicitudes")
    public ResponseEntity<?> misSolicitudes() {
        Estudiante junior = getCurrentEstudiante();
        if (junior == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(solicitudService.misSolicitudes(junior.getId()));
    }

    @GetMapping("/recibidas")
    public ResponseEntity<?> recibidas() {
        Estudiante senior = getCurrentEstudiante();
        if (senior == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(solicitudService.recibidas(senior.getId()));
    }

    @PutMapping("/{id}/aceptar")
    public ResponseEntity<?> aceptar(@PathVariable UUID id) {
        Estudiante senior = getCurrentEstudiante();
        if (senior == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            return ResponseEntity.ok(solicitudService.aceptar(id, senior.getId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<?> rechazar(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        Estudiante senior = getCurrentEstudiante();
        if (senior == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            String motivo = (String) body.getOrDefault("motivo", "");
            return ResponseEntity.ok(solicitudService.rechazar(id, senior.getId(), motivo));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
