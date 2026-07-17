package com.ucvmatch.model.dto;

import com.ucvmatch.model.EstiloAprendizaje;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class RegisterRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El código de estudiante es obligatorio")
    private String codigoEstudiante;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email debe ser válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    private String carrera;

    @Min(value = 1, message = "El ciclo debe ser al menos 1")
    @Max(value = 10, message = "El ciclo no puede ser mayor a 10")
    private Integer cicloActual;

    @DecimalMin(value = "0.0", message = "El promedio no puede ser menor a 0.0")
    @DecimalMax(value = "5.0", message = "El promedio no puede ser mayor a 5.0")
    private BigDecimal promedio;

    private EstiloAprendizaje estiloAprendizaje;

    private boolean postularSenior = false;

    private String rol;

    public RegisterRequest() {}

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getCodigoEstudiante() { return codigoEstudiante; }
    public void setCodigoEstudiante(String codigoEstudiante) { this.codigoEstudiante = codigoEstudiante; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getCarrera() { return carrera; }
    public void setCarrera(String carrera) { this.carrera = carrera; }
    public Integer getCicloActual() { return cicloActual; }
    public void setCicloActual(Integer cicloActual) { this.cicloActual = cicloActual; }
    public BigDecimal getPromedio() { return promedio; }
    public void setPromedio(BigDecimal promedio) { this.promedio = promedio; }
    public EstiloAprendizaje getEstiloAprendizaje() { return estiloAprendizaje; }
    public void setEstiloAprendizaje(EstiloAprendizaje estiloAprendizaje) { this.estiloAprendizaje = estiloAprendizaje; }
    public boolean isPostularSenior() { return postularSenior; }
    public void setPostularSenior(boolean postularSenior) { this.postularSenior = postularSenior; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}
