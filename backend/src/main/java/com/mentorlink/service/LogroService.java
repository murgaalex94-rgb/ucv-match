package com.mentorlink.service;

import com.mentorlink.model.*;
import com.mentorlink.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class LogroService {

    private final LogroRepository logroRepository;
    private final TipoLogroRepository tipoLogroRepository;
    private final UsuarioRepository usuarioRepository;

    public LogroService(LogroRepository logroRepository,
                         TipoLogroRepository tipoLogroRepository,
                         UsuarioRepository usuarioRepository) {
        this.logroRepository = logroRepository;
        this.tipoLogroRepository = tipoLogroRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Logro> misLogros(UUID usuarioId) {
        return logroRepository.findByUsuarioId(usuarioId);
    }

    public Logro otorgar(UUID usuarioId, String codigoLogro) {
        TipoLogro tipo = tipoLogroRepository.findByCodigo(codigoLogro)
                .orElseThrow(() -> new IllegalArgumentException("Tipo de logro no encontrado: " + codigoLogro));

        if (logroRepository.existsByUsuarioIdAndTipoLogroId(usuarioId, tipo.getId())) {
            throw new IllegalArgumentException("Logro ya otorgado");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Logro logro = new Logro();
        logro.setUsuario(usuario);
        logro.setTipoLogro(tipo);
        return logroRepository.save(logro);
    }

    public List<Map<String, Object>> ranking() {
        List<Logro> todos = logroRepository.findAll();
        Map<UUID, Map<String, Object>> conteo = new HashMap<>();
        for (Logro l : todos) {
            conteo.computeIfAbsent(l.getUsuario().getId(), k -> {
                Map<String, Object> m = new HashMap<>();
                m.put("usuario", l.getUsuario());
                m.put("logros", 0);
                return m;
            });
            Map<String, Object> entry = conteo.get(l.getUsuario().getId());
            entry.put("logros", (int) entry.get("logros") + 1);
        }
        return conteo.values().stream()
                .sorted((a, b) -> Integer.compare((int) b.get("logros"), (int) a.get("logros")))
                .limit(10)
                .toList();
    }
}
