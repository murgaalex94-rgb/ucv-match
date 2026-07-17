package com.ucvmatch.controller;

import com.ucvmatch.model.Estudiante;
import com.ucvmatch.model.Usuario;
import com.ucvmatch.repository.EstudianteRepository;
import com.ucvmatch.repository.UsuarioRepository;
import com.ucvmatch.service.ArbolMentoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/arbol")
public class ArbolController {

    private final ArbolMentoriaService arbolService;
    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;

    public ArbolController(ArbolMentoriaService arbolService,
                            UsuarioRepository usuarioRepository,
                            EstudianteRepository estudianteRepository) {
        this.arbolService = arbolService;
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

    @GetMapping("/mi-arbol")
    public ResponseEntity<?> miArbol() {
        Estudiante e = getCurrentEstudiante();
        if (e == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(arbolService.arbolDe(e));
    }

    @GetMapping("/impacto")
    public ResponseEntity<?> impacto() {
        Estudiante e = getCurrentEstudiante();
        if (e == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(arbolService.impacto(e));
    }
}
