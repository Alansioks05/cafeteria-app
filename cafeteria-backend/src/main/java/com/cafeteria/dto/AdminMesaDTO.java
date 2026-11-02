package com.cafeteria.dto;

public record AdminMesaDTO(
        Integer id,
        String numeroMesa,
        String codigoQrToken,
        String estado
) {}