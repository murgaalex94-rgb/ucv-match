package com.mentorlink.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "estudiantes")
public class Estudiante {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "codigo_estudiante", nullable = false, length = 20)
    private String codigoEstudiante;

    @Column(nullable = false, length = 150)
    private String carrera;

    @Column(name = "ciclo_actual", nullable = false)
    private Integer cicloActual;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal promedio;

    @Enumerated(EnumType.STRING)
    @Column(name = "estilo_aprendizaje", nullable = false, length = 20)
    private EstiloAprendizaje estiloAprendizaje;

    @Column(name = "es_senior", nullable = false)
    private boolean esSenior = false;

    @Column(name = "senior_validado", nullable = false)
    private boolean seniorValidado = false;

    @Column(columnDefinition = "TEXT")
    private String biografia;

    @Column(name = "foto_url", length = 500)
    private String fotoUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Estudiante() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public String getCodigoEstudiante() { return codigoEstudiante; }
    public void setCodigoEstudiante(String codigoEstudiante) { this.codigoEstudiante = codigoEstudiante; }
    public String getCarrera() { return carrera; }
    public void setCarrera(String carrera) { this.carrera = carrera; }
    public Integer getCicloActual() { return cicloActual; }
    public void setCicloActual(Integer cicloActual) { this.cicloActual = cicloActual; }
    public BigDecimal getPromedio() { return promedio; }
    public void setPromedio(BigDecimal promedio) { this.promedio = promedio; }
    public EstiloAprendizaje getEstiloAprendizaje() { return estiloAprendizaje; }
    public void setEstiloAprendizaje(EstiloAprendizaje estiloAprendizaje) { this.estiloAprendizaje = estiloAprendizaje; }
    public boolean isEsSenior() { return esSenior; }
    public void setEsSenior(boolean esSenior) { this.esSenior = esSenior; }
    public boolean isSeniorValidado() { return seniorValidado; }
    public void setSeniorValidado(boolean seniorValidado) { this.seniorValidado = seniorValidado; }
    public String getBiografia() { return biografia; }
    public void setBiografia(String biografia) { this.biografia = biografia; }
    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
