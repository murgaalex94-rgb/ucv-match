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
        
        if (apiKey == null || apiKey.isEmpty() || apiSecret == null || apiSecret.isEmpty()) {
            logger.warn("Stream Chat API credentials not configured. Chat functionality will be disabled.");
        }
    }

    /**
     * Crea o recupera un canal de chat entre dos usuarios
     * @param userId1 ID del primer usuario (estudiante)
     * @param userId2 ID del segundo usuario (mentor)
     * @param userName1 Nombre del primer usuario
     * @param userName2 Nombre del segundo usuario
     * @return El ID del canal creado o existente
     */
    public String createOrGetChannel(UUID userId1, UUID userId2, String userName1, String userName2) {
        if (!isConfigured()) {
            logger.error("Stream Chat client not initialized");
            throw new IllegalStateException("Stream Chat not configured");
        }

        try {
            // Crear usuarios en Stream Chat si no existen
            upsertUser(userId1.toString(), userName1);
            upsertUser(userId2.toString(), userName2);

            // Generar un ID único para el canal basado en los IDs de los usuarios
            String channelId = generateChannelId(userId1, userId2);

            // Verificar si el canal ya existe
            if (channelExists(channelId)) {
                logger.info("Channel already exists: {}", channelId);
                return channelId;
            }

            // Crear el canal con ambos usuarios como miembros
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
        try {
            String url = STREAM_API_BASE_URL + "/users";
            
            JsonObject userData = new JsonObject();
            JsonObject userObject = new JsonObject();
            userObject.addProperty("id", userId);
            userObject.addProperty("name", userName);
            userObject.addProperty("role", "user");
            
            userData.add(userId, userObject);
            
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
                if (!response.isSuccessful()) {
                    logger.warn("Failed to upsert user {}: {}", userId, response.code());
                } else {
                    logger.debug("Upserted user: {} - {}", userId, userName);
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
            
            Request request = new Request.Builder()
                    .url(url)
                    .addHeader("Authorization", "Bearer " + apiSecret)
                    .addHeader("X-Stream-Auth-Type", "jwt")
                    .get()
                    .build();
            
            try (Response response = httpClient.newCall(request).execute()) {
                return response.isSuccessful();
            }
        } catch (IOException e) {
            logger.debug("Channel does not exist: {}", channelId);
            return false;
        }
    }

    /**
     * Crea un nuevo canal
     */
    private void createChannel(String channelId, String userId1, String userId2) throws IOException {
        String url = STREAM_API_BASE_URL + "/channels/messaging/" + channelId;
        
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
            if (!response.isSuccessful()) {
                throw new IOException("Failed to create channel: " + response.code());
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
