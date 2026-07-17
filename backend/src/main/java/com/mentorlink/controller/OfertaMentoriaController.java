package com.mentorlink.controller;

import com.mentorlink.model.Estudiante;
import com.mentorlink.model.OfertaMentoria;
import com.mentorlink.model.Rol;
import com.mentorlink.model.Usuario;
import com.mentorlink.repository.EstudianteRepository;
import com.mentorlink.repository.UsuarioRepository;
import com.mentorlink.service.OfertaMentoriaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ofertas")
public class OfertaMentoriaController {

    private final OfertaMentoriaService ofertaService;
    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;

    public OfertaMentoriaController(OfertaMentoriaService ofertaService,
                                     UsuarioRepository usuarioRepository,
                                     EstudianteRepository estudianteRepository) {
        this.ofertaService = ofertaService;
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
        Estudiante senior = getCurrentEstudiante();
        if (senior == null || senior.getUsuario().getRol() != Rol.SENIOR) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Solo seniors validados"));
        }
        try {
            UUID materiaId = UUID.fromString(body.get("materiaId").toString());
            String descripcion = (String) body.getOrDefault("descripcion", "");
            Integer cupos = Integer.parseInt(body.get("cuposSemanales").toString());
            String formato = (String) body.get("formato");
            OfertaMentoria oferta = ofertaService.crear(senior.getId(), materiaId, descripcion, cupos, formato);
            return ResponseEntity.status(HttpStatus.CREATED).body(oferta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/mis-ofertas")
    public ResponseEntity<?> misOfertas() {
        Estudiante senior = getCurrentEstudiante();
        if (senior == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(ofertaService.misOfertas(senior.getId()));
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<OfertaMentoria>> disponibles() {
        return ResponseEntity.ok(ofertaService.disponibles());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        Estudiante senior = getCurrentEstudiante();
        if (senior == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            String descripcion = (String) body.getOrDefault("descripcion", "");
            Integer cupos = Integer.parseInt(body.get("cuposSemanales").toString());
            String formato = (String) body.get("formato");
            return ResponseEntity.ok(ofertaService.actualizar(id, senior.getId(), descripcion, cupos, formato));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/desactivar")
    public ResponseEntity<?> desactivar(@PathVariable UUID id) {
        Estudiante senior = getCurrentEstudiante();
        if (senior == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            ofertaService.desactivar(id, senior.getId());
            return ResponseEntity.ok(Map.of("message", "Oferta desactivada correctamente"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
