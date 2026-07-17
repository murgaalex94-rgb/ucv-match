package com.mentorlink.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "logros")
public class Logro {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_logro_id", nullable = false)
    private TipoLogro tipoLogro;

    @Column(name = "fecha_obtenida", nullable = false)
    private LocalDateTime fechaObtenida = LocalDateTime.now();

    @Column(nullable = false)
    private boolean visible = true;

    public Logro() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public TipoLogro getTipoLogro() { return tipoLogro; }
    public void setTipoLogro(TipoLogro tipoLogro) { this.tipoLogro = tipoLogro; }
    public LocalDateTime getFechaObtenida() { return fechaObtenida; }
    public void setFechaObtenida(LocalDateTime fechaObtenida) { this.fechaObtenida = fechaObtenida; }
    public boolean isVisible() { return visible; }
    public void setVisible(boolean visible) { this.visible = visible; }
}
