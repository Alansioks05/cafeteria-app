package com.cafeteria.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilitar un broker simple en memoria para enviar mensajes a los clientes
        // con el prefijo "/topic"
        config.enableSimpleBroker("/topic");

        // Prefijo para los mensajes que vienen del cliente al servidor (si los hubiera)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // El endpoint donde el frontend se conectará (ej: ws://localhost:8080/ws-cafeteria)
        registry.addEndpoint("/ws-cafeteria")
                .setAllowedOriginPatterns("*") // Permitir conexiones desde React
                .withSockJS(); // Soporte para navegadores antiguos
    }
}