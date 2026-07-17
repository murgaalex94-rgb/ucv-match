package com.mentorlink.model.dto;

import java.util.UUID;

public class AuthResponse {

    private String token;
    private UUID userId;
    private String nombre;
    private String email;
    private String rol;
    private boolean pendingValidation;
    private String message;
    private boolean error;

    public AuthResponse() {}

    public AuthResponse(String message) {
        this.message = message;
    }

    public AuthResponse(String message, boolean error) {
        this.message = message;
        this.error = error;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public boolean isPendingValidation() { return pendingValidation; }
    public void setPendingValidation(boolean pendingValidation) { this.pendingValidation = pendingValidation; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean isError() { return error; }
    public void setError(boolean error) { this.error = error; }
}
