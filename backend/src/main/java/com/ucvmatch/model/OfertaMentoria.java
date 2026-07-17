package com.ucvmatch.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ofertas_mentoria")
public class OfertaMentoria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "senior_id", nullable = false)
    private Estudiante senior;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id", nullable = false)
    private Materia materia;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "cupos_semanales", nullable = false)
    private Integer cuposSemanales;

    @Column(nullable = false, length = 20)
    private String formato;

    @Column(nullable = false, length = 10)
    private String estado = "ACTIVA";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    public OfertaMentoria() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Estudiante getSenior() { return senior; }
    public void setSenior(Estudiante senior) { this.senior = senior; }
    public Materia getMateria() { return materia; }
    public void setMateria(Materia materia) { this.materia = materia; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Integer getCuposSemanales() { return cuposSemanales; }
    public void setCuposSemanales(Integer cuposSemanales) { this.cuposSemanales = cuposSemanales; }
    public String getFormato() { return formato; }
    public void setFormato(String formato) { this.formato = formato; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
