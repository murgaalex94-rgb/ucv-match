package com.mentorlink.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sesiones")
public class Sesion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentoria_id", nullable = false)
    private Mentoria mentoria;

    @Column(name = "fecha_programada", nullable = false)
    private LocalDateTime fechaProgramada;

    @Column(name = "hora_inicio_real")
    private LocalDateTime horaInicioReal;

    @Column(name = "hora_fin_real")
    private LocalDateTime horaFinReal;

    @Column(name = "duracion_minutos")
    private Integer duracionMinutos;

    @Column(name = "temas_tratados", columnDefinition = "TEXT")
    private String temasTratados;

    @Column(nullable = false, length = 15)
    private String estado = "PROGRAMADA";

    @Column(name = "calificacion_junior")
    private Integer calificacionJunior;

    @Column(name = "calificacion_senior")
    private Integer calificacionSenior;

    @Column(name = "comentario_junior", columnDefinition = "TEXT")
    private String comentarioJunior;

    @Column(name = "comentario_senior", columnDefinition = "TEXT")
    private String comentarioSenior;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Sesion() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Mentoria getMentoria() { return mentoria; }
    public void setMentoria(Mentoria mentoria) { this.mentoria = mentoria; }
    public LocalDateTime getFechaProgramada() { return fechaProgramada; }
    public void setFechaProgramada(LocalDateTime fechaProgramada) { this.fechaProgramada = fechaProgramada; }
    public LocalDateTime getHoraInicioReal() { return horaInicioReal; }
    public void setHoraInicioReal(LocalDateTime horaInicioReal) { this.horaInicioReal = horaInicioReal; }
    public LocalDateTime getHoraFinReal() { return horaFinReal; }
    public void setHoraFinReal(LocalDateTime horaFinReal) { this.horaFinReal = horaFinReal; }
    public Integer getDuracionMinutos() { return duracionMinutos; }
    public void setDuracionMinutos(Integer duracionMinutos) { this.duracionMinutos = duracionMinutos; }
    public String getTemasTratados() { return temasTratados; }
    public void setTemasTratados(String temasTratados) { this.temasTratados = temasTratados; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public Integer getCalificacionJunior() { return calificacionJunior; }
    public void setCalificacionJunior(Integer calificacionJunior) { this.calificacionJunior = calificacionJunior; }
    public Integer getCalificacionSenior() { return calificacionSenior; }
    public void setCalificacionSenior(Integer calificacionSenior) { this.calificacionSenior = calificacionSenior; }
    public String getComentarioJunior() { return comentarioJunior; }
    public void setComentarioJunior(String comentarioJunior) { this.comentarioJunior = comentarioJunior; }
    public String getComentarioSenior() { return comentarioSenior; }
    public void setComentarioSenior(String comentarioSenior) { this.comentarioSenior = comentarioSenior; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
