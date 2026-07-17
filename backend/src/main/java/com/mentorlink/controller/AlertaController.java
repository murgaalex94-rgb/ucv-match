package com.mentorlink.controller;

import com.mentorlink.model.Rol;
import com.mentorlink.model.Usuario;
import com.mentorlink.repository.UsuarioRepository;
import com.mentorlink.service.AlertaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/alertas")
public class AlertaController {

    private final AlertaService alertaService;
    private final UsuarioRepository usuarioRepository;

    public AlertaController(AlertaService alertaService, UsuarioRepository usuarioRepository) {
        this.alertaService = alertaService;
        this.usuarioRepository = usuarioRepository;
    }

    private boolean esAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) return false;
        return usuarioRepository.findByEmail(auth.getName())
                .map(u -> u.getRol() == Rol.ADMIN).orElse(false);
    }

    @GetMapping
    public ResponseEntity<?> listar() {
        if (!esAdmin()) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(alertaService.listar());
    }

    @GetMapping("/pendientes")
    public ResponseEntity<?> pendientes() {
        if (!esAdmin()) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(Map.of("cantidad", alertaService.contarPendientes()));
    }

    @PutMapping("/{id}/atender")
    public ResponseEntity<?> atender(@PathVariable UUID id) {
        if (!esAdmin()) return ResponseEntity.status(403).build();
        try {
            alertaService.atender(id);
            return ResponseEntity.ok(Map.of("message", "Alerta atendida"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
