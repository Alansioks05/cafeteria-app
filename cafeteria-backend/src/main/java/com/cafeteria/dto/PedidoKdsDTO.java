package com.cafeteria.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoKdsDTO(
        Integer pedidoId,
        String numeroMesa,
        String estadoPedido,
        BigDecimal total,
        LocalDateTime creadoEn,
        List<DetalleKdsDTO> detalles // <-- AÑADIDO
) {}