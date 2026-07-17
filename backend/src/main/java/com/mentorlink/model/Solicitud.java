package com.mentorlink.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "solicitudes")
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "junior_id", nullable = false)
    private Estudiante junior;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "oferta_id", nullable = false)
    private OfertaMentoria oferta;

    @Column(columnDefinition = "TEXT")
    private String mensaje;

    @Column(nullable = false, length = 15)
    private String estado = "PENDIENTE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;

    @Column(name = "mensaje_rechazo", columnDefinition = "TEXT")
    private String mensajeRechazo;

    public Solicitud() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Estudiante getJunior() { return junior; }
    public void setJunior(Estudiante junior) { this.junior = junior; }
    public OfertaMentoria getOferta() { return oferta; }
    public void setOferta(OfertaMentoria oferta) { this.oferta = oferta; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getFechaRespuesta() { return fechaRespuesta; }
    public void setFechaRespuesta(LocalDateTime fechaRespuesta) { this.fechaRespuesta = fechaRespuesta; }
    public String getMensajeRechazo() { return mensajeRechazo; }
    public void setMensajeRechazo(String mensajeRechazo) { this.mensajeRechazo = mensajeRechazo; }
}
