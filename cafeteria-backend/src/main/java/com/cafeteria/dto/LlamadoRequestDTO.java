package com.cafeteria.dto;

public record LlamadoRequestDTO(
        String codigoQrToken,
        String motivo
) {}