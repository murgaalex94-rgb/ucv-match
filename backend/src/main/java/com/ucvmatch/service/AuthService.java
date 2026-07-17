package com.ucvmatch.service;

import com.ucvmatch.config.JwtUtil;
import com.ucvmatch.model.Estudiante;
import com.ucvmatch.model.EstiloAprendizaje;
import com.ucvmatch.model.Rol;
import com.ucvmatch.model.Usuario;
import com.ucvmatch.model.dto.AuthResponse;
import com.ucvmatch.model.dto.LoginRequest;
import com.ucvmatch.model.dto.RegisterRequest;
import com.ucvmatch.repository.EstudianteRepository;
import com.ucvmatch.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UsuarioRepository usuarioRepository,
                       EstudianteRepository estudianteRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.estudianteRepository = estudianteRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (!esEmailInstitucional(req.getEmail())) {
            return new AuthResponse("El email debe ser institucional (@universidad.edu)", true);
        }

        if (usuarioRepository.existsByEmail(req.getEmail())) {
            return new AuthResponse("El email ya está registrado", true);
        }

        Rol rol;
        boolean esSenior = false;
        boolean seniorValidado = false;

        if (req.getRol() != null && req.getRol().equals("ADMIN")) {
            rol = Rol.ADMIN;
        } else if (req.getCicloActual() <= 3) {
            rol = Rol.JUNIOR;
        } else if (req.getCicloActual() >= 6
                && req.getPromedio().compareTo(new BigDecimal("3.5")) >= 0
                && req.isPostularSenior()) {
            rol = Rol.SENIOR;
            esSenior = true;
        } else {
            rol = Rol.JUNIOR;
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(req.getNombre());
        usuario.setEmail(req.getEmail());
        usuario.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        usuario.setRol(rol);
        usuario.setActivo(true);
        usuario = usuarioRepository.save(usuario);

        if (rol != Rol.ADMIN) {
            Estudiante estudiante = new Estudiante();
            estudiante.setUsuario(usuario);
            estudiante.setCodigoEstudiante(req.getCodigoEstudiante());
            estudiante.setCarrera(req.getCarrera());
            estudiante.setCicloActual(req.getCicloActual());
            estudiante.setPromedio(req.getPromedio());
            estudiante.setEstiloAprendizaje(req.getEstiloAprendizaje());
            estudiante.setEsSenior(esSenior);
            estudiante.setSeniorValidado(seniorValidado);
            estudianteRepository.save(estudiante);
        }

        String mensaje = esSenior
            ? "Registro exitoso. Tu solicitud de mentor senior está pendiente de validación."
            : "Registro exitoso. Ahora puedes iniciar sesión.";

        return new AuthResponse(mensaje);
    }

    public AuthResponse login(LoginRequest req) {
        if (!esEmailInstitucional(req.getEmail())) {
            return new AuthResponse("El email debe ser institucional (@universidad.edu)", true);
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(req.getEmail());
        if (usuarioOpt.isEmpty()) {
            return new AuthResponse("Credenciales incorrectas", true);
        }

        Usuario usuario = usuarioOpt.get();

        if (!usuario.isActivo()) {
            return new AuthResponse("Cuenta desactivada", true);
        }

        if (!passwordEncoder.matches(req.getPassword(), usuario.getPasswordHash())) {
            return new AuthResponse("Credenciales incorrectas", true);
        }

        Optional<Estudiante> estudianteOpt = estudianteRepository.findByUsuarioId(usuario.getId());

        boolean pendingValidation = false;
        if (usuario.getRol() == Rol.SENIOR && estudianteOpt.isPresent()) {
            pendingValidation = !estudianteOpt.get().isSeniorValidado();
        }

        String token = jwtUtil.generateToken(usuario, pendingValidation);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUserId(usuario.getId());
        response.setNombre(usuario.getNombre());
        response.setEmail(usuario.getEmail());
        response.setRol(usuario.getRol().name());
        response.setPendingValidation(pendingValidation);
        response.setMessage("Login exitoso");

        return response;
    }

    public Map<String, Object> getCurrentUser(String email) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        if (usuarioOpt.isEmpty()) {
            return null;
        }

        Usuario usuario = usuarioOpt.get();
        Optional<Estudiante> estudianteOpt = estudianteRepository.findByUsuarioId(usuario.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("usuario", usuario);
        result.put("estudiante", estudianteOpt.orElse(null));

        return result;
    }

    private boolean esEmailInstitucional(String email) {
        return email != null && email.endsWith("@universidad.edu");
    }
}
