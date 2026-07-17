package com.mentorlink.controller;

import com.mentorlink.model.Materia;
import com.mentorlink.service.MateriaService;
import com.mentorlink.model.Rol;
import com.mentorlink.model.Usuario;
import com.mentorlink.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/materias")
public class MateriaController {

    private final MateriaService materiaService;
    private final UsuarioRepository usuarioRepository;

    public MateriaController(MateriaService materiaService, UsuarioRepository usuarioRepository) {
        this.materiaService = materiaService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<List<Materia>> listar(@RequestParam(required = false) String nombre,
                                                 @RequestParam(required = false) String carrera) {
        if (nombre != null && !nombre.isBlank()) {
            return ResponseEntity.ok(materiaService.buscarPorNombre(nombre));
        }
        if (carrera != null && !carrera.isBlank()) {
            return ResponseEntity.ok(materiaService.buscarPorCarrera(carrera));
        }
        return ResponseEntity.ok(materiaService.listarActivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Materia> detalle(@PathVariable UUID id) {
        return materiaService.porId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private boolean esAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) return false;
        return usuarioRepository.findByEmail(auth.getName())
                .map(u -> u.getRol() == Rol.ADMIN)
                .orElse(false);
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Materia materia) {
        if (!esAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            Materia creada = materiaService.crear(materia);
            return ResponseEntity.status(HttpStatus.CREATED).body(creada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable UUID id, @RequestBody Materia materia) {
        if (!esAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            return ResponseEntity.ok(materiaService.actualizar(id, materia));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable UUID id) {
        if (!esAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            materiaService.desactivar(id);
            return ResponseEntity.ok(Map.of("message", "Materia desactivada correctamente"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/todas")
    public ResponseEntity<List<Materia>> listarTodas() {
        if (!esAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(materiaService.listarTodas());
    }
}
