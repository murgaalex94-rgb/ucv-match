package com.mentorlink.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "arbol_mentoria")
public class ArbolMentoria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private Estudiante mentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aprendiz_id", nullable = false, unique = true)
    private Estudiante aprendiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id")
    private Materia materia;

    @Column(nullable = false)
    private Integer generacion;

    @Column(name = "nodo_padre_id")
    private UUID nodoPadreId;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio = LocalDateTime.now();

    public ArbolMentoria() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Estudiante getMentor() { return mentor; }
    public void setMentor(Estudiante mentor) { this.mentor = mentor; }
    public Estudiante getAprendiz() { return aprendiz; }
    public void setAprendiz(Estudiante aprendiz) { this.aprendiz = aprendiz; }
    public Materia getMateria() { return materia; }
    public void setMateria(Materia materia) { this.materia = materia; }
    public Integer getGeneracion() { return generacion; }
    public void setGeneracion(Integer generacion) { this.generacion = generacion; }
    public UUID getNodoPadreId() { return nodoPadreId; }
    public void setNodoPadreId(UUID nodoPadreId) { this.nodoPadreId = nodoPadreId; }
    public LocalDateTime getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDateTime fechaInicio) { this.fechaInicio = fechaInicio; }
}
