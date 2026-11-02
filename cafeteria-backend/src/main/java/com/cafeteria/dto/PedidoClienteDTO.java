package com.cafeteria.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PedidoClienteDTO(
        Integer pedidoId,
        String numeroMesa,
        String estadoPedido,
        LocalDateTime creadoEn,
        List<DetalleKdsDTO> detalles
) {}