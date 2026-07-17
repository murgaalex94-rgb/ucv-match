package com.ucvmatch.controller;

import com.ucvmatch.model.Usuario;
import com.ucvmatch.repository.UsuarioRepository;
import com.ucvmatch.service.LogroService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/logros")
public class LogroController {

    private final LogroService logroService;
    private final UsuarioRepository usuarioRepository;

    public LogroController(LogroService logroService, UsuarioRepository usuarioRepository) {
        this.logroService = logroService;
        this.usuarioRepository = usuarioRepository;
    }

    private Usuario getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) return null;
        return usuarioRepository.findByEmail(auth.getName()).orElse(null);
    }

    @GetMapping("/mis-logros")
    public ResponseEntity<?> misLogros() {
        Usuario u = getCurrentUser();
        if (u == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(logroService.misLogros(u.getId()));
    }

    @GetMapping("/ranking")
    public ResponseEntity<?> ranking() {
        return ResponseEntity.ok(logroService.ranking());
    }
}
