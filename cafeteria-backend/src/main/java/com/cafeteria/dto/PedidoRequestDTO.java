package com.cafeteria.dto;

import java.util.List;

public record PedidoRequestDTO(
        String codigoQrToken, // El frontend envía el token de la mesa escaneada
        List<DetallePedidoRequestDTO> detalles
) {}