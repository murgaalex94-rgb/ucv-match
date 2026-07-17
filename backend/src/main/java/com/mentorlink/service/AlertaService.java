package com.mentorlink.service;

import com.mentorlink.model.Alerta;
import com.mentorlink.model.Estudiante;
import com.mentorlink.repository.AlertaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AlertaService {

    private final AlertaRepository alertaRepository;

    public AlertaService(AlertaRepository alertaRepository) {
        this.alertaRepository = alertaRepository;
    }

    public Alerta crear(String tipo, Estudiante estudiante, String descripcion, String severidad) {
        Alerta a = new Alerta();
        a.setTipo(tipo);
        a.setEstudiante(estudiante);
        a.setDescripcion(descripcion);
        a.setSeveridad(severidad);
        a.setEstado("PENDIENTE");
        return alertaRepository.save(a);
    }

    public List<Alerta> listar() {
        return alertaRepository.findAll();
    }

    public List<Alerta> pendientes() {
        return alertaRepository.findByEstado("PENDIENTE");
    }

    public long contarPendientes() {
        return alertaRepository.countByEstado("PENDIENTE");
    }

    public void atender(UUID id) {
        Alerta a = alertaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Alerta no encontrada"));
        a.setEstado("ATENDIDA");
        alertaRepository.save(a);
    }
}
