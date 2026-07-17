package com.ucvmatch.controller;

import com.ucvmatch.model.*;
import com.ucvmatch.repository.*;
import com.ucvmatch.service.SesionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/sesiones")
public class SesionController {

    private final SesionService sesionService;
    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;

    public SesionController(SesionService sesionService,
                             UsuarioRepository usuarioRepository,
                             EstudianteRepository estudianteRepository) {
        this.sesionService = sesionService;
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
    public ResponseEntity<?> programar(@RequestBody Map<String, Object> body) {
        Estudiante e = getCurrentEstudiante();
        if (e == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            UUID mentoriaId = UUID.fromString(body.get("mentoriaId").toString());
            String fechaStr = (String) body.get("fechaProgramada");
            java.time.LocalDateTime fecha = java.time.LocalDateTime.parse(fechaStr);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(sesionService.programar(mentoriaId, fecha, e.getId()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/{id}/iniciar")
    public ResponseEntity<?> iniciar(@PathVariable UUID id) {
        Estudiante e = getCurrentEstudiante();
        if (e == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            return ResponseEntity.ok(sesionService.iniciar(id, e.getId()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<?> finalizar(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        Estudiante e = getCurrentEstudiante();
        if (e == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            Integer calificacion = body.get("calificacion") != null
                    ? Integer.parseInt(body.get("calificacion").toString()) : null;
            String comentario = (String) body.getOrDefault("comentario", "");
            String temas = (String) body.getOrDefault("temasTratados", "");
            return ResponseEntity.ok(sesionService.finalizar(id, e.getId(), calificacion, comentario, temas));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
