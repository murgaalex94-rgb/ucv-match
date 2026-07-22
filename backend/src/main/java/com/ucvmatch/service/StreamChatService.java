package com.ucvmatch.service;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class StreamChatService {

    private static final Logger logger = LoggerFactory.getLogger(StreamChatService.class);
    private static final String STREAM_API_BASE_URL = "https://chat.stream-io-api.com";
    
    private final String apiKey;
    private final String apiSecret;
    private final OkHttpClient httpClient;
    private final Gson gson;
    
    public StreamChatService(
            @Value("${stream.api.key}") String apiKey,
            @Value("${stream.api.secret}") String apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.gson = new Gson();
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();
        
        logger.info("=== STREAM CHAT SERVICE INIT ===");
        logger.info("API Key configured: {} (length: {})", apiKey != null && !apiKey.isEmpty(), apiKey != null ? apiKey.length() : 0);
        logger.info("API Secret configured: {} (length: {})", apiSecret != null && !apiSecret.isEmpty(), apiSecret != null ? apiSecret.length() : 0);
        
        if (apiKey == null || apiKey.isEmpty() || apiSecret == null || apiSecret.isEmpty()) {
            logger.warn("Stream Chat API credentials not configured. Chat functionality will be disabled.");
        }
    }

    /**
     * Crea o recupera un canal de chat entre dos usuarios
     */
    public String createOrGetChannel(UUID userId1, UUID userId2, String userName1, String userName2) {
        return createOrGetChannel(userId1, userId2, userName1, "", null, userName2, "", null);
    }

    /**
     * Crea o recupera un canal de chat entre dos usuarios enviando datos detallados de participante
     */
    public String createOrGetChannel(UUID userId1, UUID userId2, 
                                     String nombre1, String apellido1, String avatar1,
                                     String nombre2, String apellido2, String avatar2) {
        logger.info("=== createOrGetChannel START ===");
        logger.info("User1: {} ({} {}), User2: {} ({} {})", userId1, nombre1, apellido1, userId2, nombre2, avatar2);
        logger.info("isConfigured(): {}", isConfigured());
        
        if (!isConfigured()) {
            logger.error("Stream Chat client not initialized - credentials missing");
            throw new IllegalStateException("Stream Chat not configured");
        }

        try {
            // Crear/actualizar usuarios en Stream Chat con datos de nombre, apellido y avatar
            logger.info("Upserting users with participant details...");
            upsertUser(userId1.toString(), nombre1, apellido1, avatar1);
            upsertUser(userId2.toString(), nombre2, apellido2, avatar2);

            String channelId = generateChannelId(userId1, userId2);
            logger.info("Generated channelId: {}", channelId);

            boolean exists = channelExists(channelId);
            logger.info("Channel exists: {}", exists);
            
            if (exists) {
                logger.info("Channel already exists: {}", channelId);
                return channelId;
            }

            logger.info("Creating new channel...");
            createChannel(channelId, userId1.toString(), userId2.toString());
            logger.info("Created new channel: {}", channelId);
            return channelId;

        } catch (Exception e) {
            logger.error("Error creating or getting channel", e);
            throw new RuntimeException("Failed to create or get Stream Chat channel", e);
        }
    }

    /**
     * Crea o actualiza un usuario en Stream Chat usando REST API
     */
    private void upsertUser(String userId, String userName) {
        upsertUser(userId, userName, "", null);
    }

    private void upsertUser(String userId, String nombreUsuario, String apellidoUsuario, String avatarUrl) {
        try {
            String url = STREAM_API_BASE_URL + "/users";
            
            String fullNombre = ((nombreUsuario != null ? nombreUsuario : "") + " " + (apellidoUsuario != null ? apellidoUsuario : "")).trim();
            if (fullNombre.isEmpty()) fullNombre = "Usuario";

            logger.debug("Upserting user: {} ({}) avatar: {}", userId, fullNombre, avatarUrl);
            
            JsonObject userData = new JsonObject();
            JsonObject usersMap = new JsonObject();
            JsonObject userObject = new JsonObject();
            
            userObject.addProperty("id", userId);
            userObject.addProperty("name", fullNombre);
            userObject.addProperty("nombre_usuario", nombreUsuario != null ? nombreUsuario : "");
            userObject.addProperty("apellido_usuario", apellidoUsuario != null ? apellidoUsuario : "");
            userObject.addProperty("role", "user");
            
            if (avatarUrl != null && !avatarUrl.trim().isEmpty()) {
                userObject.addProperty("image", avatarUrl);
                userObject.addProperty("avatar_url", avatarUrl);
            }
            
            usersMap.add(userId, userObject);
            userData.add("users", usersMap);
            
            RequestBody body = RequestBody.create(
                MediaType.parse("application/json"), 
                gson.toJson(userData)
            );
            
            Request request = new Request.Builder()
                    .url(url)
                    .addHeader("Authorization", "Bearer " + apiSecret)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("X-Stream-Auth-Type", "jwt")
                    .post(body)
                    .build();
            
            try (Response response = httpClient.newCall(request).execute()) {
                String responseBody = response.body() != null ? response.body().string() : "null";
                logger.info("Upsert user {} - HTTP {}: {}", userId, response.code(), responseBody);
                if (!response.isSuccessful()) {
                    logger.warn("Failed to upsert user {}: HTTP {}", userId, response.code());
                }
            }
        } catch (IOException e) {
            logger.error("Error upserting user: {}", userId, e);
        }
    }

    /**
     * Verifica si un canal existe
     */
    private boolean channelExists(String channelId) {
        try {
            String url = STREAM_API_BASE_URL + "/channels/messaging/" + channelId;
            logger.debug("Checking channel existence: {}", url);
            
            Request request = new Request.Builder()
                    .url(url)
                    .addHeader("Authorization", "Bearer " + apiSecret)
                    .addHeader("X-Stream-Auth-Type", "jwt")
                    .get()
                    .build();
            
            try (Response response = httpClient.newCall(request).execute()) {
                logger.info("Channel exists check - HTTP {}: {}", response.code(), channelId);
                return response.isSuccessful();
            }
        } catch (IOException e) {
            logger.debug("Channel does not exist (exception): {}", channelId, e);
            return false;
        }
    }

    /**
     * Crea un nuevo canal
     */
    private void createChannel(String channelId, String userId1, String userId2) throws IOException {
        String url = STREAM_API_BASE_URL + "/channels/messaging/" + channelId;
        logger.info("Creating channel at: {}", url);
        
        JsonObject channelData = new JsonObject();
        channelData.addProperty("created_by", userId1);
        
        JsonObject members = new JsonObject();
        members.addProperty(userId1, true);
        members.addProperty(userId2, true);
        channelData.add("members", members);
        
        RequestBody body = RequestBody.create(
            MediaType.parse("application/json"), 
            gson.toJson(channelData)
        );
        
        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + apiSecret)
                .addHeader("Content-Type", "application/json")
                .addHeader("X-Stream-Auth-Type", "jwt")
                .post(body)
                .build();
        
        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "null";
            logger.info("Create channel response - HTTP {}: {}", response.code(), responseBody);
            if (!response.isSuccessful()) {
                throw new IOException("Failed to create channel: HTTP " + response.code() + " - " + responseBody);
            }
        }
    }

    /**
     * Genera un ID de canal único y consistente basado en los IDs de los usuarios
     * El ID es el mismo sin importar el orden de los usuarios
     */
    private String generateChannelId(UUID userId1, UUID userId2) {
        // Ordenar los IDs alfabéticamente para asegurar consistencia
        String id1 = userId1.toString();
        String id2 = userId2.toString();
        
        if (id1.compareTo(id2) < 0) {
            return "mentoria_" + id1 + "_" + id2;
        } else {
            return "mentoria_" + id2 + "_" + id1;
        }
    }

    /**
     * Verifica si el servicio está configurado correctamente
     */
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isEmpty() && apiSecret != null && !apiSecret.isEmpty();
    }
}
