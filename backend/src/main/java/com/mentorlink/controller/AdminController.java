package com.mentorlink.controller;

import com.mentorlink.model.Estudiante;
import com.mentorlink.model.Rol;
import com.mentorlink.model.Usuario;
import com.mentorlink.repository.EstudianteRepository;
import com.mentorlink.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;

    public AdminController(UsuarioRepository usuarioRepository, EstudianteRepository estudianteRepository) {
        this.usuarioRepository = usuarioRepository;
        this.estudianteRepository = estudianteRepository;
    }

    private boolean esAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) return false;
        return usuarioRepository.findByEmail(auth.getName())
                .map(u -> u.getRol() == Rol.ADMIN)
                .orElse(false);
    }

    @GetMapping("/seniors-pendientes")
    public ResponseEntity<?> seniorsPendientes() {
        if (!esAdmin()) return ResponseEntity.status(403).build();
        List<Estudiante> pendientes = estudianteRepository.findAll().stream()
                .filter(e -> e.isEsSenior() && !e.isSeniorValidado())
                .toList();
        return ResponseEntity.ok(pendientes);
    }

    @PutMapping("/seniors/{id}/validar")
    public ResponseEntity<?> validarSenior(@PathVariable UUID id) {
        if (!esAdmin()) return ResponseEntity.status(403).build();
        Estudiante e = estudianteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado"));
        e.setSeniorValidado(true);
        estudianteRepository.save(e);
        return ResponseEntity.ok(Map.of("message", "Senior validado correctamente"));
    }

    @PutMapping("/seniors/{id}/rechazar")
    public ResponseEntity<?> rechazarSenior(@PathVariable UUID id) {
        if (!esAdmin()) return ResponseEntity.status(403).build();
        Estudiante e = estudianteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado"));
        e.setSeniorValidado(false);
        e.setEsSenior(false);
        Usuario u = e.getUsuario();
        u.setRol(Rol.JUNIOR);
        usuarioRepository.save(u);
        estudianteRepository.save(e);
        return ResponseEntity.ok(Map.of("message", "Solicitud senior rechazada"));
    }
}
